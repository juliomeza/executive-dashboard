import React, { useEffect } from 'react';
import dashboardData from './data/data.json';

// Add global style to hide scrollbars but allow scrolling
const hideScrollbarStyle = `
  /* Hide scrollbars on tab navigation */
  .ant-tabs-nav-wrap, .ant-tabs-nav {
    overflow-x: auto !important;
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE and Edge */
    max-width: 100vw !important;
  }
  .ant-tabs-nav-wrap::-webkit-scrollbar, .ant-tabs-nav::-webkit-scrollbar {
    display: none !important; /* Chrome, Safari, Opera */
  }
  
  /* Adjust tabs for small screens */
  @media (max-width: 576px) {
    .ant-tabs-tab {
      padding: 6px 8px !important;
      margin-right: 2px !important;
    }
    .ant-tabs-tab-btn {
      font-size: 12px !important;
    }
    
    /* Make Ant Design components mobile-friendly */
    .ant-col {
      padding: 4px !important;
    }
    
    .ant-card {
      max-width: 100% !important;
      margin: 0 !important;
    }
    
    .ant-card-body {
      padding: 12px !important;
    }
    
    .ant-statistic-title {
      font-size: 12px !important;
    }
    
    .ant-statistic-content {
      font-size: 18px !important;
    }
    
    /* Force containers to fit */
    .ant-tabs-content, .ant-tabs-tabpane {
      width: 100% !important;
      max-width: 100vw !important;
      overflow-x: hidden !important;
    }
    
    /* Ensure all tables and grids fit mobile screens */
    .ant-table-wrapper {
      width: 100% !important;
      overflow-x: auto !important;
    }
  }
  
  /* Ensure nothing breaks out of its container */
  * {
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }
`;

// Add TypeScript type assertion to ensure data is properly typed
interface DashboardData {
  kpis: {
    totalOrders: number;
    revenue: number;
    onTimeShipmentRate: number;
    avgCostPerOrder: number;
    warehouseUtilization: number;
  };
  warehouses: Array<{
    id: string;
    name: string;
    location: string;
    ordersToday: number;
    capacityUsedPercent: number;
    onTimeRate: number;
    issues: number;
  }>;
  recentOrders: Array<{
    key: string;
    orderId: string;
    customer: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    date: string;
    warehouse: string;
  }>;
  inventory: {
    totalValue: number;
    stockTurnRate: number;
    itemsLowStock: number;
    agingItemsCount: number;
    valueByWarehouse: Array<{
      id: string;
      name: string;
      value: number;
    }>;
  };
  agingInventory: Array<{
    key: string;
    sku: string;
    productName: string;
    daysInStock: number;
    quantity: number;
    warehouse: string;
  }>;
  alerts: Array<{
    id: number;
    type: 'warning' | 'error' | 'success';
    message: string;
    details: string;
  }>;
  financialRatios: {
    laborCostPercentage: number;
  };
  warehouseCosts: {
    monthly: Array<{
      id: string;
      name: string;
      labor: number;
      operations: number;
      utilities: number;
      maintenance: number;
      total: number;
    }>;
  };
}

// --- Material UI Imports ---
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// --- Ant Design Imports ---
import { Tabs, Statistic, Row, Col, Progress, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

// --- Recharts Import for Charts ---
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList
} from 'recharts';

const { TabPane } = Tabs;

// Type aliases for easier reference
type WarehousePerformance = DashboardData['warehouses'][0];
type RecentOrder = DashboardData['recentOrders'][0];
type AgingInventoryItem = DashboardData['agingInventory'][0];

// Access the data from the imported JSON file and assert the type
const { kpis, warehouses, recentOrders, inventory, agingInventory, alerts, financialRatios, warehouseCosts } = dashboardData as unknown as DashboardData;

// --- React Component ---
const DashboardApp: React.FC = () => {
  // Add global styles when component mounts
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = hideScrollbarStyle;
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- AntD Table Columns ---
  const warehouseColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text: string, record: WarehousePerformance) => <a onClick={() => alert(`Viewing details for ${record.name}`)}>{text}</a> },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Orders Today', dataIndex: 'ordersToday', key: 'ordersToday', sorter: (a: WarehousePerformance, b: WarehousePerformance) => a.ordersToday - b.ordersToday },
    { title: 'Capacity', dataIndex: 'capacityUsedPercent', key: 'capacityUsedPercent', render: (percent: number) => <Progress percent={percent} size="small" status={percent > 90 ? 'exception' : percent > 80 ? 'active' : 'normal'} /> },
    { title: 'On-Time Rate', dataIndex: 'onTimeRate', key: 'onTimeRate', render: (rate: number) => <Tag color={rate >= 95 ? 'green' : rate >= 90 ? 'orange' : 'red'}>{rate.toFixed(1)}%</Tag> },
    { title: 'Open Issues', dataIndex: 'issues', key: 'issues', sorter: (a: WarehousePerformance, b: WarehousePerformance) => a.issues - b.issues },
  ];

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status: RecentOrder['status']) => {
        let color = 'geekblue';
        if (status === 'Delivered') color = 'green';
        else if (status === 'Shipped') color = 'blue';
        else if (status === 'Processing') color = 'gold';
        else if (status === 'Pending') color = 'orange';
        else if (status === 'Cancelled') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse' },
  ];

    const agingInventoryColumns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Product Name', dataIndex: 'productName', key: 'productName' },
    { title: 'Days In Stock', dataIndex: 'daysInStock', key: 'daysInStock', sorter: (a: AgingInventoryItem, b: AgingInventoryItem) => a.daysInStock - b.daysInStock, defaultSortOrder: 'descend' as const, },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* --- Header using MUI AppBar --- */}
      <AppBar position="static">
        <Toolbar>
          <AssessmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Reliable HealthCare Logistics
          </Typography>
          {/* Add User Profile/Logout here if needed */}
        </Toolbar>
      </AppBar>

      {/* --- Main Content Area --- */}
      <Box component="main" sx={{ 
          flexGrow: 1, 
          bgcolor: 'background.default', 
          p: { xs: 1, sm: 2, md: 3 }, 
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 0, sm: 1, md: 2 },
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
          {/* --- Tabs using AntD --- */}
          <Tabs 
            defaultActiveKey="1" 
            type="card" 
            size="small"
            tabBarGutter={4}
            className="dashboard-tabs"
            style={{ 
              width: '100%', 
              maxWidth: '100%'
            }}
            tabBarStyle={{
              marginBottom: '8px',
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%'
            }}
          >
            {/* --- Overview Tab --- */}
            <TabPane tab={<span><AssessmentIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }} /> Overview</span>} key="1" 
              style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
              <Paper elevation={2} sx={{ p: 2, mb: 3, overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <Row gutter={[16, 16]} style={{ margin: 0, maxWidth: '100%' }}>
                      <Col xs={24} sm={12} md={6} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                          <Card sx={{ height: '100%', width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Total Orders (Month)"
                                      value={kpis.totalOrders}
                                      precision={0}
                                      valueStyle={{ color: '#3f8600' }}
                                      prefix={<LocalShippingIcon />}
                                      suffix="orders"
                                  />
                                  <Typography variant="caption" color="text.secondary">vs last month +5.2%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                          <Card sx={{ height: '100%', width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Revenue (Month)"
                                      value={kpis.revenue}
                                      precision={2}
                                      valueStyle={{ color: '#3f8600' }}
                                      prefix="$"
                                  />
                                  <Typography variant="caption" color="text.secondary">vs last month +8.1%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                          <Card sx={{ height: '100%', width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="On-Time Shipment Rate"
                                      value={kpis.onTimeShipmentRate}
                                      precision={1}
                                      valueStyle={kpis.onTimeShipmentRate >= 95 ? { color: '#3f8600' } : { color: '#cf1322' }}
                                      prefix={kpis.onTimeShipmentRate >= 95 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                      suffix="%"
                                  />
                                  <Typography variant="caption" color="text.secondary">Target: 95%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                          <Card sx={{ height: '100%', width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Avg. Cost Per Order"
                                      value={kpis.avgCostPerOrder}
                                      precision={2}
                                      valueStyle={{ color: '#cf1322' }} // Lower is better, assume current is slightly high
                                      prefix="$"
                                  />
                                   <Typography variant="caption" color="text.secondary">vs last month +$0.15</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                  </Row>
              </Paper>

              <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={4}>
                      <Card sx={{ height: '100%' }}>
                          <CardHeader title="Overall Warehouse Utilization" />
                          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                              <Progress
                                type="dashboard"
                                percent={kpis.warehouseUtilization}
                                format={(percent) => `${percent}% Full`}
                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                status={kpis.warehouseUtilization > 90 ? 'exception' : kpis.warehouseUtilization > 80 ? 'active' : 'normal'}
                              />
                               <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>Across all locations</Typography>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Revenue Trend (Month)" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Line Chart Placeholder: Monthly Revenue]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Shows revenue trend over the past 30 days compared to the previous period.
                                </Typography>
                          </CardContent>
                      </Card>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title="Alerts & Notifications" />
                      <CardContent>
                        <List dense>
                          {alerts.map((alert, index) => (
                            <React.Fragment key={alert.id}>
                              <ListItem>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  {alert.type === 'warning' && <WarningAmberIcon color="warning" />}
                                  {alert.type === 'error' && <ErrorOutlineIcon color="error" />}
                                  {alert.type === 'success' && <CheckCircleOutlineIcon color="success" />}
                                </ListItemIcon>
                                <ListItemText primary={alert.message} secondary={alert.details} />
                              </ListItem>
                              {index < alerts.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
              </Grid>
            </TabPane>

            {/* --- Warehouse Performance Tab --- */}
            <TabPane tab={<span><WarehouseIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }} /> Warehouses</span>} key="2" style={{ overflowX: 'hidden', width: '100%' }}>
               <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Warehouse Performance Summary" />
                            <CardContent>
                                <Table
                                    columns={warehouseColumns}
                                    dataSource={warehouses}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Cost per Warehouse (Monthly)" />
                          <CardContent>
                              <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={warehouseCosts.monthly}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis 
                                      tickFormatter={(value) => `$${value/1000}k`}
                                    />
                                    <Tooltip 
                                      formatter={(value) => [`$${value.toLocaleString()}`, '']}
                                      labelFormatter={(label) => `Warehouse: ${label}`}
                                    />
                                    <Legend />
                                    <Bar 
                                      dataKey="labor" 
                                      name="Labor" 
                                      stackId="a" 
                                      fill="#8884d8" 
                                    />
                                    <Bar 
                                      dataKey="operations" 
                                      name="Operations" 
                                      stackId="a" 
                                      fill="#82ca9d" 
                                    />
                                    <Bar 
                                      dataKey="utilities" 
                                      name="Utilities" 
                                      stackId="a" 
                                      fill="#ffc658" 
                                    />
                                    <Bar 
                                      dataKey="maintenance" 
                                      name="Maintenance" 
                                      stackId="a" 
                                      fill="#ff8042" 
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <Typography variant="caption" display="block" gutterBottom>
                                Compares operational costs across warehouses. West Coast has the highest total costs, primarily due to labor expenses.
                              </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Warehouse Locations" />
                          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#f0f2f5' }}>
                               <Typography variant="h6" color="text.secondary">
                                    [Map Placeholder]
                                </Typography>
                                {/* You could integrate a map library like Leaflet or Google Maps here */}
                          </CardContent>
                      </Card>
                    </Grid>
               </Grid>
            </TabPane>

            {/* --- Order Fulfillment Tab --- */}
            <TabPane tab={<span><LocalShippingIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }} /> Orders</span>} key="3" style={{ overflowX: 'hidden', width: '100%' }}>
                <Grid container spacing={3}>
                     <Grid item xs={12} md={6} lg={4}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Order Status Breakdown" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Pie Chart Placeholder: Orders by Status]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Current distribution of orders across different fulfillment stages (Pending, Processing, Shipped, etc.).
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                     <Grid item xs={12} md={6} lg={8}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="On-Time Shipment Trend (Daily)" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Line Chart Placeholder: Daily On-Time Rate]
                                </Typography>
                               <Typography variant="caption" display="block" gutterBottom>
                                    Tracks the percentage of orders shipped on time over the last 30 days.
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Recent Orders" />
                            <CardContent>
                                <Table
                                    columns={orderColumns}
                                    dataSource={recentOrders}
                                    rowKey="key"
                                    pagination={{ pageSize: 10 }}
                                     size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPane>

             {/* --- Inventory Tab --- */}
            <TabPane tab={<span><InventoryIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }} /> Inventory</span>} key="4" style={{ overflowX: 'hidden', width: '100%' }}>
               <Grid container spacing={3}>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                           <Statistic title="Total Inventory Value" value={inventory.totalValue} precision={0} prefix="$" />
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Statistic title="Stock Turn Rate (Annualized)" value={inventory.stockTurnRate} precision={1} suffix=" turns" />
                        </CardContent>
                      </Card>
                   </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Statistic title="Items Low Stock" value={inventory.itemsLowStock} valueStyle={{ color: '#cf1322' }} prefix={<WarningAmberIcon />} suffix=" SKUs"/>
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                           <Statistic title="Aging Items (>90 days)" value={inventory.agingItemsCount} valueStyle={{ color: '#faad14' }} prefix={<WarningAmberIcon />} suffix=" SKUs"/>
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} lg={7}>
                        <Card>
                            <CardHeader title="Top Aging Inventory Items (>90 days)" />
                            <CardContent>
                                <Table
                                    columns={agingInventoryColumns}
                                    dataSource={agingInventory}
                                    rowKey="key"
                                    pagination={{ pageSize: 5 }}
                                     size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                     <Grid item xs={12} lg={5}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Inventory Value by Warehouse" />
                          <CardContent>
                              <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={inventory.valueByWarehouse}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    layout="vertical"
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      type="number" 
                                      tickFormatter={(value) => `$${value/1000000}M`}
                                    />
                                    <YAxis 
                                      dataKey="name" 
                                      type="category" 
                                      width={100}
                                    />
                                    <Tooltip 
                                      formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, 'Inventory Value']}
                                      labelFormatter={(label) => `Warehouse: ${label}`}
                                    />
                                    <Legend />
                                    <Bar 
                                      dataKey="value" 
                                      name="Inventory Value" 
                                      fill="#3f8600" 
                                    >
                                      <LabelList 
                                        dataKey="value" 
                                        position="right" 
                                        formatter={(value: number | string) => `$${(Number(value)/1000000).toFixed(1)}M`}
                                      />
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <Typography variant="caption" display="block" gutterBottom>
                                West Coast Gateway holds the highest inventory value at $4.15M, representing 33% of total inventory across all warehouses.
                              </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
               </Grid>
            </TabPane>

             {/* --- Financials Tab --- */}
            <TabPane tab={<span><MonetizationOnIcon style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: 4 }} /> Finance</span>} key="5" style={{ overflowX: 'hidden', width: '100%' }}>
                <Grid container spacing={3}>
                     <Grid item xs={12} lg={6}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Revenue vs. Cost (Monthly)" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Line Chart Placeholder: Revenue and Cost Trends]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Tracks total monthly revenue against total operational costs.
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                      <Grid item xs={12} lg={6}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Operational Cost Breakdown (Monthly)" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Pie Chart Placeholder: Cost Categories]
                                </Typography>
                               <Typography variant="caption" display="block" gutterBottom>
                                    Distribution of costs: Labor, Shipping, Storage, Utilities, Overhead.
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <Card sx={{ height: '100%' }}>
                          <CardHeader title="Profitability per Warehouse" />
                          <CardContent>
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Bar Chart Placeholder: Profit per Warehouse]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Compares estimated profit margins for each warehouse location.
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
                     <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardHeader title="Key Financial Ratios" />
                            <CardContent>
                                <Row gutter={[16, 24]}>
                                     <Col span={12}>
                                        <Statistic title="Avg. Revenue per Order" value={kpis.revenue / kpis.totalOrders} precision={2} prefix="$" />
                                     </Col>
                                     <Col span={12}>
                                        <Statistic title="Avg. Cost per Order" value={kpis.avgCostPerOrder} precision={2} prefix="$" />
                                     </Col>
                                     <Col span={12}>
                                        <Statistic title="Estimated Gross Margin" value={((kpis.revenue / kpis.totalOrders) - kpis.avgCostPerOrder) / (kpis.revenue / kpis.totalOrders) * 100 } precision={1} suffix="%" />
                                     </Col>
                                      <Col span={12}>
                                        {/* Placeholder for another ratio */}
                                         <Statistic title="Labor Cost % of Revenue" value={financialRatios.laborCostPercentage} precision={1} suffix="%" />
                                     </Col>
                                </Row>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPane>

          </Tabs>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardApp;