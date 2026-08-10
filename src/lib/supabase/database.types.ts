export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          phone_normalized: string;
          email: string | null;
          address: string | null;
          status: Database["public"]["Enums"]["customer_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: Database["public"]["Enums"]["customer_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: Database["public"]["Enums"]["customer_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      interactions: {
        Row: {
          id: string;
          customer_id: string;
          type: Database["public"]["Enums"]["interaction_type"];
          memo: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type: Database["public"]["Enums"]["interaction_type"];
          memo: string;
          created_at?: string;
          created_by: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "interactions_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      list_customers: {
        Args: {
          p_search?: string | null;
          p_status?: Database["public"]["Enums"]["customer_status"] | null;
          p_page?: number;
          p_page_size?: number;
        };
        Returns: Array<{
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          status: Database["public"]["Enums"]["customer_status"];
          created_at: string;
          updated_at: string;
          total_count: number;
        }>;
      };
    };
    Enums: {
      user_role: "ADMIN" | "STAFF";
      customer_status: "NEW" | "CONTACTED" | "BOOKED" | "COMPLETED" | "CANCELLED";
      interaction_type: "PHONE" | "SMS" | "EMAIL" | "VISIT";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
