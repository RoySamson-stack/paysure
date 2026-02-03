const sequelize = require('../config/database');
const { User, Wallet, Deposit, SalaryPayout, TransactionLog } = require('../models');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    await sequelize.sync({ force: true });
    console.log('✓ Database tables created');
    
    // Create demo user for MVP showcase
    const demoUser = await User.create({
      phoneNumber: '254712345678',
      firstName: 'Demo',
      lastName: 'User',
      targetSalary: 5000,
      payoutDay: 28,
      isRegistrationComplete: true,
      consistencyScore: 85
    });
    
    await Wallet.create({
      userId: demoUser.id,
      depositBalance: 1500,
      salaryBalance: 3000,
      bufferBalance: 200
    });
    
    // Create sample deposits
    const deposits = [
      { amount: 100, status: 'completed', mpesaReceiptNumber: 'DEMO001' },
      { amount: 150, status: 'completed', mpesaReceiptNumber: 'DEMO002' },
      { amount: 200, status: 'completed', mpesaReceiptNumber: 'DEMO003' },
    ];
    
    for (const deposit of deposits) {
      await Deposit.create({
        userId: demoUser.id,
        ...deposit
      });
      
      await TransactionLog.create({
        userId: demoUser.id,
        type: 'deposit',
        amount: deposit.amount,
        reference: deposit.mpesaReceiptNumber,
        description: 'Demo deposit',
        status: 'completed'
      });
    }
    
    console.log('✓ Demo data created');
    console.log('\nDemo User Credentials:');
    console.log('Phone: 254712345678');
    console.log('OTP: Any 6-digit code (in dev mode)');
    
    console.log('\n✓ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
