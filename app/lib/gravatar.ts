export function getGravatarUrl(
  email: string,
  size: number = 1080,
  defaultImage: string = "mp"
): string {
  let hash: string;

  if (typeof window === "undefined") {
    const crypto = require("crypto");
    hash = crypto
      .createHash("md5")
      .update(email.toLowerCase().trim())
      .digest("hex");
  } else {
    hash = getClientSideHash(email.toLowerCase().trim());
  }

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

function getClientSideHash(email: string): string {
  const gravatarEmail = process.env.GRAVATAR_EMAIL || "thesomritdasgupta@gmail.com";
  if (email === gravatarEmail) {
    return "a8e1f469bb7013312e34531805d35517";
  }

  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, "0");
}
