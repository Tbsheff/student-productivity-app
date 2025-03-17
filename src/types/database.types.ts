export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          color: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          completed: boolean | null;
          created_at: string;
          current_value: number | null;
          deadline: string | null;
          description: string | null;
          id: string;
          target_value: number | null;
          title: string;
          unit: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string;
          current_value?: number | null;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          target_value?: number | null;
          title: string;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string;
          current_value?: number | null;
          deadline?: string | null;
          description?: string | null;
          id?: string;
          target_value?: number | null;
          title?: string;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          content: string | null;
          course_id: string | null;
          created_at: string;
          id: string;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          course_id?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          course_id?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
          created_at: string;
          duration_minutes: number | null;
          end_time: string | null;
          id: string;
          notes: string | null;
          start_time: string;
          subject: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes?: number | null;
          end_time?: string | null;
          id?: string;
          notes?: string | null;
          start_time: string;
          subject: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number | null;
          end_time?: string | null;
          id?: string;
          notes?: string | null;
          start_time?: string;
          subject?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subtasks: {
        Row: {
          completed: boolean | null;
          created_at: string;
          id: string;
          task_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          completed?: boolean | null;
          created_at?: string;
          id?: string;
          task_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          completed?: boolean | null;
          created_at?: string;
          id?: string;
          task_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          course: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          estimated_minutes: number | null;
          id: string;
          priority: string | null;
          status: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          course?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          course?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          image: string | null;
          name: string | null;
          token_identifier: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          token_identifier: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          token_identifier?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
