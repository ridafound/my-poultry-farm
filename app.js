const express = require('express');
const app = express();
const cors = require("cors");
const birdsRoutes = require('./src/routes/birds.routes');
const eggsRoutes = require('./src/routes/eggs.routes');
const salesRoutes = require('./src/routes/sales.routes');
const expensesRoutes = require('./src/routes/expenses.routes')
const dashboardRoutes = require('./src/routes/dashboard.routes');
const inventoryRoutes = require('./src/routes/inventory.routes');
const overviewRoutes = require('./src/routes/overview.routes')
const authRoutes =  require('./src/routes/auth.routes')
const connectDB = require('./src/config/db')
require('dotenv').config();
const errorHandlerMiddleware = require('./src/middleware/error-handler')
const notFoundMiddleware = require('./src/middleware/not-found');




app.use(cors());
app.use(express.json());

app.use('/api/v1/bird', birdsRoutes);
app.use('/api/v1/egg', eggsRoutes);
app.use('/api/v1/sale', salesRoutes);
app.use('/api/v1/expenses', expensesRoutes);
app.use('/api/v1/', dashboardRoutes);
app.use('/api/v1/', inventoryRoutes);
app.use('/api/v1/', overviewRoutes);
app.use('/api/v1/auth', authRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)



app.get('/', (req, res) => {
  res.send('Server running...');
});








const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => console.log(` connnected ....app is listening on ${port} `))
  } catch (error) {
    console.log(error)
  }
}


start();