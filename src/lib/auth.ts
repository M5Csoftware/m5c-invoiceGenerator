import { User } from "@/types/auth";

// Static credentials as requested
export const STATIC_USERS = [
  { username: "admin", password: "@M5Clogs.com2025", name: "Administrator", role: "admin" },
  { username: "user1", password: "Varun@123", name: "varun", role: "user" },
  { username: "user2", password: "Sujan@123", name: "Sujan", role: "user" },
  { username: "manager1", password: "Suraj@123", name: "Suraj Chandrakar", role: "manager" },
  { username: "manager2", password: "Harman@123", name: "Harmanjeet Singh", role: "manager" },
];

export const authenticateUser = (username: string, password: string): User | null => {
  const user = STATIC_USERS.find(u => u.username === username && u.password === password);
  if (user) {
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  return null;
};
