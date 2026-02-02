const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// Get statement data for a period
router.get('/data', auth, async (req, res) => {
  try {
    const { period } = req.query; // 3, 6, 12 months
    const userId = req.user.id;
    
    const months = parseInt(period) || 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Get transactions
    const transactions = await db.query(`
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.description,
        t.created_at,
        t.reference_number
      FROM transaction_logs t
      WHERE t.user_id = $1 
        AND t.created_at >= $2
      ORDER BY t.created_at DESC
    `, [userId, startDate]);
    
    // Get deposits summary
    const depositsSummary = await db.query(`
      SELECT 
        COUNT(*) as total_deposits,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM deposits 
      WHERE user_id = $1 
        AND created_at >= $2 
        AND status = 'completed'
    `, [userId, startDate]);
    
    // Get salary payouts
    const salaryPayouts = await db.query(`
      SELECT 
        sp.id,
        sp.amount,
        sp.payout_date,
        sp.status,
        sp.month_year
      FROM salary_payouts sp
      WHERE sp.user_id = $1 
        AND sp.payout_date >= $2
      ORDER BY sp.payout_date DESC
    `, [userId, startDate]);
    
    // Get current wallet balances
    const wallets = await db.query(`
      SELECT 
        deposit_balance,
        salary_balance,
        buffer_balance
      FROM wallets 
      WHERE user_id = $1
    `, [userId]);
    
    res.json({
      period: `${months} months`,
      startDate,
      endDate: new Date(),
      transactions: transactions.rows,
      summary: {
        deposits: depositsSummary.rows[0],
        payouts: salaryPayouts.rows,
        currentBalances: wallets.rows[0] || {}
      }
    });
    
  } catch (error) {
    console.error('Error fetching statement data:', error);
    res.status(500).json({ error: 'Failed to fetch statement data' });
  }
});

// Download PDF statement
router.get('/download', auth, async (req, res) => {
  try {
    const { period } = req.query;
    const userId = req.user.id;
    
    // Get user info
    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const userData = user.rows[0];
    
    // Get statement data
    const months = parseInt(period) || 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const transactions = await db.query(`
      SELECT 
        t.type,
        t.amount,
        t.description,
        t.created_at,
        t.reference_number
      FROM transaction_logs t
      WHERE t.user_id = $1 
        AND t.created_at >= $2
      ORDER BY t.created_at DESC
    `, [userId, startDate]);
    
    const depositsSummary = await db.query(`
      SELECT 
        COUNT(*) as total_deposits,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM deposits 
      WHERE user_id = $1 
        AND created_at >= $2 
        AND status = 'completed'
    `, [userId, startDate]);
    
    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=M-Salary-Statement-${months}months.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('M-SALARY FINANCIAL STATEMENT', 50, 50);
    doc.fontSize(12).text(`Period: ${months} months (${startDate.toDateString()} - ${new Date().toDateString()})`, 50, 80);
    doc.text(`Account: ${userData.phone_number}`, 50, 100);
    doc.text(`Generated: ${new Date().toDateString()}`, 50, 120);
    
    // Summary
    doc.fontSize(16).text('SUMMARY', 50, 160);
    const summary = depositsSummary.rows[0];
    doc.fontSize(12)
       .text(`Total Deposits: ${summary.total_deposits || 0}`, 50, 190)
       .text(`Total Amount: KES ${parseFloat(summary.total_amount || 0).toLocaleString()}`, 50, 210)
       .text(`Average Deposit: KES ${parseFloat(summary.average_amount || 0).toLocaleString()}`, 50, 230);
    
    // Transactions
    doc.fontSize(16).text('TRANSACTIONS', 50, 270);
    
    let yPos = 300;
    doc.fontSize(10);
    
    transactions.rows.forEach((txn) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      
      const date = new Date(txn.created_at).toDateString();
      const type = txn.type.toUpperCase();
      const amount = `KES ${parseFloat(txn.amount).toLocaleString()}`;
      
      doc.text(`${date}`, 50, yPos)
         .text(`${type}`, 150, yPos)
         .text(`${amount}`, 250, yPos)
         .text(`${txn.reference_number || ''}`, 350, yPos);
      
      yPos += 20;
    });
    
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate statement' });
  }
});

module.exports = router;
