
import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 获取已验证用户的所有项目
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/projects - User ID:', req.user.id);
    
    const [projects] = await pool.query(
      'SELECT id, name, status, DATE_FORMAT(created_at, "%m/%d/%Y") as created, responses FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    console.log('Projects found:', projects.length);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: '获取项目列表失败' });
  }
});

// 创建新项目
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/projects - Request body:', req.body);
    
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '项目名称不能为空' });
    }
    
    // Generate a unique project ID
    const projectId = `FS-${Date.now().toString().substring(6)}-${name.substring(0, 5).replace(/\s+/g, '-')}`;
    
    console.log('Generated project ID:', projectId);
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert the project into the projects table
      const [result] = await connection.query(
        'INSERT INTO projects (id, name, description, user_id, status, responses) VALUES (?, ?, ?, ?, ?, ?)',
        [projectId, name, description || '', req.user.id, 'draft', 0]
      );
      
      console.log('Project inserted, creating project_questions table');
      
      // Create a project_questions table for this project
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_questions_${projectId.replace(/[^a-zA-Z0-9]/g, '_')} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL,
          options JSON,
          required BOOLEAN DEFAULT false,
          order_index INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Creating project_responses table');
      
      // Create a project_responses table for this project
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_responses_${projectId.replace(/[^a-zA-Z0-9]/g, '_')} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          response_data JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.commit();
      
      console.log('Project creation successful');
      
      res.status(201).json({
        id: projectId,
        name,
        description: description || '',
        status: 'draft',
        created: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        responses: 0,
        message: '项目创建成功'
      });
    } catch (error) {
      console.error('Error in transaction:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: '创建项目失败: ' + error.message });
  }
});

// 删除项目
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const sanitizedId = projectId.replace(/[^a-zA-Z0-9]/g, '_');

    console.log(`DELETE /api/projects/${projectId} - User ID: ${req.user.id}`);

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if project exists and belongs to the user
      const [projects] = await connection.query(
        'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        [projectId, req.user.id]
      );
      
      if (projects.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: '项目不存在或无权限删除' });
      }
      
      console.log('Project found, deleting from projects table');
      
      // Delete the project
      await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
      
      console.log('Dropping project_questions table');
      
      // Drop the project_questions table
      await connection.query(`DROP TABLE IF EXISTS project_questions_${sanitizedId}`);
      
      console.log('Dropping project_responses table');
      
      // Drop the project_responses table
      await connection.query(`DROP TABLE IF EXISTS project_responses_${sanitizedId}`);
      
      await connection.commit();
      
      console.log('Project deletion successful');
      
      res.json({ message: '项目删除成功' });
    } catch (error) {
      console.error('Error in transaction:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: '删除项目失败' });
  }
});

export default router;
