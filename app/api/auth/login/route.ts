import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Mock authentication - replace with actual auth logic
  if (email && password) {
    return NextResponse.json({
      success: true,
      token: "mock_jwt_token",
      user: {
        id: "1",
        email,
        name: "Admin User",
        role: "admin",
      },
    })
  }

  return NextResponse.json(
    {
      success: false,
      error: "Invalid credentials",
    },
    { status: 401 },
  )
}
