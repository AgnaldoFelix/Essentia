// services/supabaseUserService.ts
import { supabase } from '@/lib/supabase'

export interface SupabaseUser {
  id: string
  username: string
  age: number
  avatar?: string
  created_at: string
  updated_at: string
}

export class SupabaseUserService {
  static async createOrUpdateUser(userData: {
    id: string
    username: string
    age: number
    avatar?: string
  }): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: userData.id,
            username: userData.username,
            age: userData.age,
            avatar: userData.avatar,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single()

      if (error) {
        console.error('Error creating/updating user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error)
      return null
    }
  }

  static async getUserById(userId: string): Promise<SupabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  static async getOnlineUsers(): Promise<SupabaseUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username')

      if (error) {
        console.error('Error fetching online users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getOnlineUsers:', error)
      return []
    }
  }
}