'use server';
/**
 * @fileOverview A flow for predicting delivery travel time using an external model.
 * - predictDeliveryTime - A function that calls the external prediction model.
 */


class LabelEncoder {
  private labelMap: Map<string, number> = new Map();
  private nextValue: number = 0;

  fit(data: string[]): void {
    for (const label of data) {
      if (!this.labelMap.has(label)) {
        this.labelMap.set(label, this.nextValue);
        this.nextValue++;
      }
    }
  }

  transform(data: string[]): number[] {
    const encodedData: number[] = [];
    for (const label of data) {
      if (this.labelMap.has(label)) {
        encodedData.push(this.labelMap.get(label)!);
      } else {
        // Handle unknown labels, e.g., throw an error or assign a default value
        throw new Error(`Unknown label: ${label}`);
      }
    }
    return encodedData;
  }

  fitTransform(data: string[]): number[] {
    this.fit(data);
    return this.transform(data);
  }
}


export async function predictDeliveryTime(payload: Object) {
  
    const response = await fetch('http://34.35.16.97:8080/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch prediction: ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    return result;
  }
