import crypto from "crypto";

/**
 * Generate a Gravatar URL from an email address
 * @param email - The email address
 * @param size - The size of the image
 * @param defaultImage - Default image type if no Gravatar exists
 * @returns Gravatar URL
 */
export function getGravatarUrl(
  email: string,
  size: number = 1080,
  defaultImage: string = "mp"
): string {
  // Create MD5 hash of the email
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase().trim())
    .digest("hex");

  // Construct the Gravatar URL
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}
