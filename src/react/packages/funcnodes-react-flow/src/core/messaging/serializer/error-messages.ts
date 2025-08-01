export interface ErrorMessage {
  type: "error";
  error: string;
  tb: string[];
  id?: string;
}
