import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {  
    const { email, password } = await req.json();  
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
    
      return NextResponse.json({ success: true, message: "Login successful!" });
    } else {
     
      return NextResponse.json(
        { success: false, message: "Incorrect admin email or password." },
        { status: 401 } 
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}