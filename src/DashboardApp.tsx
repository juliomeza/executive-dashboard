import React from 'react';

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

const { TabPane } = Tabs;

// --- Fake Data Interfaces ---
interface KpiData {
  totalOrders: number;
  revenue: number;
  onTimeShipmentRate: number;
  avgCostPerOrder: number;
  warehouseUtilization: number;
}

interface WarehousePerformance {
  id: string;
  name: string;
  location: string;
  ordersToday: number;
  capacityUsedPercent: number;
  onTimeRate: number;
  issues: number;
}

interface RecentOrder {
  key: string;
  orderId: string;
  customer: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  warehouse: string;
}

interface InventoryStatus {
  totalValue: number;
  stockTurnRate: number;
  itemsLowStock: number;
  agingItemsCount: number;
}

interface AgingInventoryItem {
  key: string;
  sku: string;
  productName: string;
  daysInStock: number;
  quantity: number;
  warehouse: string;
}

// --- Fake Data Generation ---
const generateFakeData = () => {
  const kpis: KpiData = {
    totalOrders: 12580,
    revenue: 157250.75,
    onTimeShipmentRate: 96.5,
    avgCostPerOrder: 5.85,
    warehouseUtilization: 78,
  };

  const warehouses: WarehousePerformance[] = [
    { id: 'WH001', name: 'North Hub', location: 'Chicago, IL', ordersToday: 152, capacityUsedPercent: 85, onTimeRate: 98.2, issues: 1 },
    { id: 'WH002', name: 'South Central', location: 'Dallas, TX', ordersToday: 210, capacityUsedPercent: 72, onTimeRate: 95.0, issues: 5 },
    { id: 'WH003', name: 'West Coast Gateway', location: 'Los Angeles, CA', ordersToday: 305, capacityUsedPercent: 91, onTimeRate: 97.1, issues: 2 },
    { id: 'WH004', name: 'East Dock', location: 'Newark, NJ', ordersToday: 188, capacityUsedPercent: 68, onTimeRate: 94.5, issues: 8 },
  ];

  const recentOrders: RecentOrder[] = [
    { key: '1', orderId: 'ORD-9875', customer: 'RetailCo', status: 'Shipped', date: '2023-10-27 10:15', warehouse: 'WH001' },
    { key: '2', orderId: 'ORD-9874', customer: 'eShop Now', status: 'Processing', date: '2023-10-27 09:30', warehouse: 'WH003' },
    { key: '3', orderId: 'ORD-9873', customer: 'BigBox Inc.', status: 'Delivered', date: '2023-10-26 14:00', warehouse: 'WH002' },
    { key: '4', orderId: 'ORD-9872', customer: 'RetailCo', status: 'Pending', date: '2023-10-27 11:00', warehouse: 'WH001' },
    { key: '5', orderId: 'ORD-9871', customer: 'Gadget World', status: 'Cancelled', date: '2023-10-25 16:00', warehouse: 'WH004' },
  ];

  const inventory: InventoryStatus = {
    totalValue: 12500000,
    stockTurnRate: 4.2,
    itemsLowStock: 45,
    agingItemsCount: 120,
  };

  const agingInventory: AgingInventoryItem[] = [
    { key: '1', sku: 'SKU1001', productName: 'Product A', daysInStock: 185, quantity: 50, warehouse: 'WH002' },
    { key: '2', sku: 'SKU2034', productName: 'Product B', daysInStock: 150, quantity: 200, warehouse: 'WH001' },
    { key: '3', sku: 'SKU5877', productName: 'Product C', daysInStock: 121, quantity: 75, warehouse: 'WH003' },
    { key: '4', sku: 'SKU1009', productName: 'Product D', daysInStock: 95, quantity: 110, warehouse: 'WH002' },
  ];


  return { kpis, warehouses, recentOrders, inventory, agingInventory };
};

const fakeData = generateFakeData();

// --- React Component ---
const DashboardApp: React.FC = () => {

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
            3PL Executive Dashboard
          </Typography>
          {/* Add User Profile/Logout here if needed */}
        </Toolbar>
      </AppBar>

      {/* --- Main Content Area --- */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Container maxWidth="xl"> {/* Use MUI Container for max width and centering */}
          {/* --- Tabs using AntD --- */}
          <Tabs defaultActiveKey="1" type="card">
            {/* --- Overview Tab --- */}
            <TabPane tab={<span><AssessmentIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Overview</span>} key="1">
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}> {/* MUI Paper for background */}
                  <Row gutter={[16, 16]}> {/* AntD Row/Col for KPI grid */}
                      <Col xs={24} sm={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Total Orders (Month)"
                                      value={fakeData.kpis.totalOrders}
                                      precision={0}
                                      valueStyle={{ color: '#3f8600' }}
                                      prefix={<LocalShippingIcon />}
                                      suffix="orders"
                                  />
                                  <Typography variant="caption" color="text.secondary">vs last month +5.2%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Revenue (Month)"
                                      value={fakeData.kpis.revenue}
                                      precision={2}
                                      valueStyle={{ color: '#3f8600' }}
                                      prefix="$"
                                  />
                                  <Typography variant="caption" color="text.secondary">vs last month +8.1%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="On-Time Shipment Rate"
                                      value={fakeData.kpis.onTimeShipmentRate}
                                      precision={1}
                                      valueStyle={fakeData.kpis.onTimeShipmentRate >= 95 ? { color: '#3f8600' } : { color: '#cf1322' }}
                                      prefix={fakeData.kpis.onTimeShipmentRate >= 95 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                      suffix="%"
                                  />
                                  <Typography variant="caption" color="text.secondary">Target: 95%</Typography>
                              </CardContent>
                          </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                          <Card sx={{ height: '100%' }}>
                              <CardContent>
                                  <Statistic
                                      title="Avg. Cost Per Order"
                                      value={fakeData.kpis.avgCostPerOrder}
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
                                percent={fakeData.kpis.warehouseUtilization}
                                format={(percent) => `${percent}% Full`}
                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                status={fakeData.kpis.warehouseUtilization > 90 ? 'exception' : fakeData.kpis.warehouseUtilization > 80 ? 'active' : 'normal'}
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
                          <ListItem>
                            <ListItemIcon sx={{ minWidth: 32 }}><WarningAmberIcon color="warning" /></ListItemIcon>
                            <ListItemText primary="WH002: High pending orders" secondary="Investigate processing delay" />
                          </ListItem>
                          <Divider component="li" />
                           <ListItem>
                            <ListItemIcon sx={{ minWidth: 32 }}><ErrorOutlineIcon color="error" /></ListItemIcon>
                            <ListItemText primary="WH004: Staffing level low" secondary="Potential impact on outbound" />
                          </ListItem>
                           <Divider component="li" />
                           <ListItem>
                            <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleOutlineIcon color="success" /></ListItemIcon>
                            <ListItemText primary="New Client Onboarded: Acme Corp" secondary="Initial shipments starting next week" />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
              </Grid>
            </TabPane>

            {/* --- Warehouse Performance Tab --- */}
            <TabPane tab={<span><WarehouseIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Warehouses</span>} key="2">
               <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="Warehouse Performance Summary" />
                            <CardContent>
                                <Table
                                    columns={warehouseColumns}
                                    dataSource={fakeData.warehouses}
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
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Bar Chart Placeholder: Cost by Warehouse]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                    Compares operational costs across different warehouse locations.
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
            <TabPane tab={<span><LocalShippingIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Order Fulfillment</span>} key="3">
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
                                    dataSource={fakeData.recentOrders}
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
            <TabPane tab={<span><InventoryIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Inventory</span>} key="4">
               <Grid container spacing={3}>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                           <Statistic title="Total Inventory Value" value={fakeData.inventory.totalValue} precision={0} prefix="$" />
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Statistic title="Stock Turn Rate (Annualized)" value={fakeData.inventory.stockTurnRate} precision={1} suffix=" turns" />
                        </CardContent>
                      </Card>
                   </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Statistic title="Items Low Stock" value={fakeData.inventory.itemsLowStock} valueStyle={{ color: '#cf1322' }} prefix={<WarningAmberIcon />} suffix=" SKUs"/>
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} md={6} lg={3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                           <Statistic title="Aging Items (>90 days)" value={fakeData.inventory.agingItemsCount} valueStyle={{ color: '#faad14' }} prefix={<WarningAmberIcon />} suffix=" SKUs"/>
                        </CardContent>
                      </Card>
                   </Grid>
                   <Grid item xs={12} lg={7}>
                        <Card>
                            <CardHeader title="Top Aging Inventory Items (>90 days)" />
                            <CardContent>
                                <Table
                                    columns={agingInventoryColumns}
                                    dataSource={fakeData.agingInventory}
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
                               <Typography variant="body1" color="text.secondary" align="center" sx={{pt: 4, pb: 4}}>
                                    [Bar Chart Placeholder: Inventory Value per Warehouse]
                                </Typography>
                                <Typography variant="caption" display="block" gutterBottom>
                                   Distribution of total inventory value across locations.
                                </Typography>
                          </CardContent>
                      </Card>
                    </Grid>
               </Grid>
            </TabPane>

             {/* --- Financials Tab --- */}
            <TabPane tab={<span><MonetizationOnIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Financials</span>} key="5">
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
                                        <Statistic title="Avg. Revenue per Order" value={fakeData.kpis.revenue / fakeData.kpis.totalOrders} precision={2} prefix="$" />
                                     </Col>
                                     <Col span={12}>
                                        <Statistic title="Avg. Cost per Order" value={fakeData.kpis.avgCostPerOrder} precision={2} prefix="$" />
                                     </Col>
                                     <Col span={12}>
                                        <Statistic title="Estimated Gross Margin" value={((fakeData.kpis.revenue / fakeData.kpis.totalOrders) - fakeData.kpis.avgCostPerOrder) / (fakeData.kpis.revenue / fakeData.kpis.totalOrders) * 100 } precision={1} suffix="%" />
                                     </Col>
                                      <Col span={12}>
                                        {/* Placeholder for another ratio */}
                                         <Statistic title="Labor Cost % of Revenue" value={28.5} precision={1} suffix="%" />
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