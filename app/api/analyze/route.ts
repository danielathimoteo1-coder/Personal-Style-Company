import { NextResponse } from "next/server";
import type { ClientProfile } from "@/lib/analysis";
import {
  getOpenAIErrorDetails,
  getUserFacingOpenAIErrorMessage,
} from "@/lib/openai-errors";
import {
  ACCEPTED_ANALYSIS_IMAGE_TYPES,
  MAX_ANALYSIS_IMAGE_SIZE,
  runPersonalAnalysis,
} from "@/lib/personal-analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("photo");
    const profile: ClientProfile = {
      age: readString(formData.get("age")),
      sex: readString(formData.get("sex")),
      height: readString(formData.get("height")),
      skinTone: readString(formData.get("skinTone")),
      undertone: readString(formData.get("undertone")),
      hairColor: readString(formData.get("hairColor")),
      eyeColor: readString(formData.get("eyeColor")),
      styleGoal: readString(formData.get("styleGoal")),
      routine: readString(formData.get("routine")),
      climate: readString(formData.get("climate")),
      budget: readString(formData.get("budget")),
      dressCode: readString(formData.get("dressCode")),
      makeupLevel: readString(formData.get("makeupLevel")),
      favoriteColors: readString(formData.get("favoriteColors")),
      avoidedPieces: readString(formData.get("avoidedPieces")),
      bodyFocus: readString(formData.get("bodyFocus")),
      occasionNeeds: readString(formData.get("occasionNeeds")),
      comfortNeeds: readString(formData.get("comfortNeeds")),
      modestyPreference: readString(formData.get("modestyPreference")),
      footwearPreference: readString(formData.get("footwearPreference")),
      accessoryPreference: readString(formData.get("accessoryPreference")),
      shoppingLimit: readString(formData.get("shoppingLimit")),
      restrictions: readString(formData.get("restrictions")),
    };

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Envie uma imagem para gerar a analise." },
        { status: 400 },
      );
    }

    if (!ACCEPTED_ANALYSIS_IMAGE_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Use uma imagem JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (image.size > MAX_ANALYSIS_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "A imagem deve ter ate 8 MB." },
        { status: 400 },
      );
    }

    if (!profile.age || !profile.sex || !profile.height) {
      return NextResponse.json(
        { error: "Preencha idade, sexo/genero e altura." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const analysis = await runPersonalAnalysis({
      imageBytes: bytes,
      imageType: image.type,
      profile,
    });

    return NextResponse.json({
      mode: analysis.metadata.modo,
      analysis,
    });
  } catch (error) {
    console.error("Analyze API error", getOpenAIErrorDetails(error));
    return NextResponse.json(
      {
        error: getUserFacingOpenAIErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
