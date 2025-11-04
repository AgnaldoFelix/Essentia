import { useState } from 'react';

interface FoodProduct {
  id: string;
  name: string;
  protein_100g: number;
  energy_kcal_100g: number;
  quantity: string;
}

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  nutriments?: {
    proteins_100g?: number;
    energy_kcal_100g?: number;
  };
  quantity?: string;
}

export function useFoodSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodProduct[]>([]);

  const searchFood = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&fields=code,product_name,nutriments,quantity`
      );
      const data = (await response.json()) as { products?: OpenFoodFactsProduct[] };

      const products: FoodProduct[] = (data.products || [])
        .filter((product: OpenFoodFactsProduct) =>
          !!product.code &&
          !!product.product_name &&
          typeof product.nutriments?.proteins_100g === 'number' &&
          typeof product.nutriments?.energy_kcal_100g === 'number'
        )
        .map((product: OpenFoodFactsProduct) => ({
          id: product.code as string,
          name: product.product_name as string,
          protein_100g: product.nutriments!.proteins_100g as number,
          energy_kcal_100g: product.nutriments!.energy_kcal_100g as number,
          quantity: product.quantity || '100g'
        }))
        .slice(0, 10); // Limitando a 10 resultados

      setSuggestions(products);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    suggestions,
    searchFood,
  };
}
