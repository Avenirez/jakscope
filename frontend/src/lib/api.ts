const API_BASE = "";

export interface District {
  id: number;
  name: string;
}

export interface Village {
  id: number;
  name: string;
}

export interface DashboardData {
  village_id: number;
  village_name: string;
  district_name: string;
}

export function getQrisImageUrl(): string {
  return `${API_BASE}/api/donate/qris`;
}
