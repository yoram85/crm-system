import { User } from '../types'

// Seed data for initial users
export const initialUsers: Omit<User, 'id' | 'createdAt'>[] = [
  {
    email: 'admin@crm.com',
    firstName: 'מנהל',
    lastName: 'ראשי',
    role: 'admin',
    status: 'active',
    department: 'ניהול',
    phone: '050-1234567',
    monthlyTarget: 100000,
  },
  {
    email: 'sales@crm.com',
    firstName: 'איש',
    lastName: 'מכירות',
    role: 'sales',
    status: 'active',
    department: 'מכירות',
    phone: '050-7654321',
    monthlyTarget: 50000,
  },
  {
    email: 'support@crm.com',
    firstName: 'נציג',
    lastName: 'תמיכה',
    role: 'support',
    status: 'active',
    department: 'שירות לקוחות',
    phone: '050-1111111',
  },
]
