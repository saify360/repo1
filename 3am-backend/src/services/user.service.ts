import { User, CreateUserDTO } from '../types';
import { query } from '../utils/database';
import { LedgerService } from './ledger.service';
import { supabase } from '../utils/database';

export class UserService {
  // Create new user
  static async createUser(data: CreateUserDTO): Promise<User> {
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.display_name,
          username: data.username
        }
      }
    });

    if (authError) throw authError;

    // Create user in database
    const result = await query(
      `INSERT INTO users (id, email, username, display_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [authData.user!.id, data.email, data.username, data.display_name, data.role || 'viewer']
    );

    const user = result.rows[0];

    // Create ledger
    await LedgerService.createLedger(user.id);

    // Create profile if creator
    if (data.role === 'creator') {
      await query(
        'INSERT INTO profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    return user;
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Upgrade to creator
  static async upgradeToCreator(userId: string): Promise<void> {
    await query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['creator', userId]
    );

    await query(
      'INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [userId]
    );
  }

  // Update profile
  static async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && ['display_name', 'bio', 'profile_image', 'banner_image'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }
}
