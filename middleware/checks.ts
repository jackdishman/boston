export const testImage = (
  url: string,
  timeoutT: number = 5000
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timer: number | undefined;

    img.onerror = img.onabort = () => {
      if (timer) clearTimeout(timer);
      reject("error");
    };

    img.onload = () => {
      if (timer) clearTimeout(timer);
      resolve("success");
    };

    timer = window.setTimeout(() => {
      img.src = ""; // Stops the image loading
      reject("timeout");
    }, timeoutT);

    img.src = url;
  });
};

/**
 * Validates if a given URL points to a valid image.
 *
 * @param url - The URL of the image to be validated.
 * @returns A promise that resolves to a boolean indicating whether the image URL is valid.
 */
export async function testImageSSR(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD", // Fetch only headers to check the content type
    });

    // Check if the request was successful and if the content type is an image
    if (
      response.ok &&
      response.headers.get("content-type")?.startsWith("image/")
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error validating image URL:", error);
    return false;
  }
}

export const isValidEthereumAddress = (address: string): boolean => {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
};
