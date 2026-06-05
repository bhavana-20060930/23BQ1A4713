import { NextRequest, NextResponse } from "next/server";
const API = "http://4.224.186.213/evaluation-service/notifications";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJiaGF2YW5hZWVzaGFAZ21haWwuY29tIiwiZXhwIjoxNzgwNjQwNDgxLCJpYXQiOjE3ODA2Mzk1ODEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1NGYxMDRlZS1iZjJmLTRkNTctYTg0ZS03MmU4ZDE1OTk5NWYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJkYXNhcmkgYmhhdmFuYSIsInN1YiI6ImRkMDkzMjk0LWQ2YjItNGIyZS1hYTA5LWU5YTIxYzg3NWU2YiJ9LCJlbWFpbCI6ImJoYXZhbmFlZXNoYUBnbWFpbC5jb20iLCJuYW1lIjoiZGFzYXJpIGJoYXZhbmEiLCJyb2xsTm8iOiIyM2JxMWE0NzEzIiwiYWNjZXNzQ29kZSI6IlFRZEVZeSIsImNsaWVudElEIjoiZGQwOTMyOTQtZDZiMi00YjJlLWFhMDktZTlhMjFjODc1ZTZiIiwiY2xpZW50U2VjcmV0IjoiUHBDRURnYkNlU2JiZVl1cyJ9.Bsc_SMvLrYtnoykuykZ_q8DWGTNShGj6HqttH8yynMs";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => params.append(key, value));
  const res = await fetch(`${API}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
