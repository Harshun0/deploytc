import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import TipCalculation from '@/models/TipCalculation';

export async function GET() {
  try {
    await connectMongoDB();
    
    // Fetch the 10 most recent tip calculations, sorted by date
    const tipCalculations = await TipCalculation.find()
      .sort({ date: -1 })
      .limit(10);
    
    return NextResponse.json(tipCalculations);
  } catch (error) {
    console.error('Error fetching tip calculations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tip calculations' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const body = await request.json();
    
    // Validate required fields
    const { 
      customerName, 
      mobileNumber, 
      billAmount, 
      tipAmount, 
      totalAmount, 
      tipPercentage 
    } = body;

    if (!customerName || !mobileNumber || billAmount <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Create new tip calculation
    const newTipCalculation = await TipCalculation.create({
      customerName,
      mobileNumber,
      billAmount,
      tipAmount,
      totalAmount,
      tipPercentage
    });

    return NextResponse.json(newTipCalculation, { status: 201 });
  } catch (error) {
    console.error('Error creating tip calculation:', error);
    return NextResponse.json(
      { error: 'Failed to create tip calculation' }, 
      { status: 500 }
    );
  }
} 