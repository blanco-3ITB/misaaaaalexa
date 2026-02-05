// Mock data for testing and development

export const mockMessengers = [
  {
    _id: '1',
    name: 'John Smith',
    email: 'm1@example.com',
    phone: '+1 555-0001',
    area: 'Zone A',
    employeeId: 'M001',
    isActive: true,
  },
  {
    _id: '2',
    name: 'Jane Doe',
    email: 'm2@test.com',
    phone: '+1 555-0002',
    area: 'Zone B',
    employeeId: 'M002',
    isActive: true,
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    email: 'm3@test.com',
    phone: '+1 555-0003',
    area: 'Zone C',
    employeeId: 'M003',
    isActive: false,
  },
];

export const mockBills = [
  {
    _id: '1',
    accountNumber: 'ACC-001-2024',
    customerName: 'Acme Corporation',
    address: '123 Main St, Downtown',
    route: 'Route-A',
    billType: 'regular_bill',
    status: 'delivered',
    amount: 1500,
  },
  {
    _id: '2',
    accountNumber: 'ACC-002-2024',
    customerName: 'TechVision Inc',
    address: '456 Tech Ave, Innovation Hub',
    route: 'Route-A',
    billType: 'disconnection_notice',
    status: 'assigned',
    amount: 0,
  },
  {
    _id: '3',
    accountNumber: 'ACC-003-2024',
    customerName: 'Global Trading Ltd',
    address: '789 Business Blvd, Commerce Park',
    route: 'Route-B',
    billType: 'regular_bill',
    status: 'unassigned',
    amount: 2000,
  },
];

export const mockDeliveries = [
  {
    _id: '1',
    customer: 'Acme Corporation',
    address: '123 Main St, Downtown',
    status: 'delivered',
    messenger: 'John Smith',
    proofCount: 1,
    deliveryDate: new Date().toISOString(),
  },
  {
    _id: '2',
    customer: 'TechVision Inc',
    address: '456 Tech Ave, Innovation Hub',
    status: 'in-progress',
    messenger: 'Jane Doe',
    proofCount: 0,
    deliveryDate: null,
  },
];
