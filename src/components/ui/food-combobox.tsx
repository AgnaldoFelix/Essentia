import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFoodSearch } from "@/hooks/useFoodSearch";

function useDebounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  const timer = React.useRef<number | null>(null);
  const savedFn = React.useRef(fn);

  React.useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  const debounced = React.useCallback((...args: Parameters<T>) => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      savedFn.current(...args);
    }, delay);
  }, [delay]);

  React.useEffect(() => {
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return debounced as (...args: Parameters<T>) => void;
}

interface FoodComboboxProps {
  value: string;
  amount: string;
  onSelect: (details: {
    name: string;
    amount: string;
    protein: number;
    calories: number;
    protein_100g: number;
    calories_100g: number;
  }) => void;
}

interface SelectedFood {
  name: string;
  protein_100g: number;
  calories_100g: number;
}

export function FoodCombobox({ value, amount, onSelect }: FoodComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const [selectedFood, setSelectedFood] = React.useState<SelectedFood | null>(null);
  const { isLoading, suggestions, searchFood } = useFoodSearch();
  const debouncedSearch = useDebounce(searchFood, 300);

  const calculateNutrients = React.useCallback((food: SelectedFood, grams: string) => {
    const gramsNum = parseFloat(grams);
    if (!gramsNum || isNaN(gramsNum)) return;

    const ratio = gramsNum / 100;
    return {
      name: food.name,
      amount: grams,
      protein: Math.round(food.protein_100g * ratio * 10) / 10,
      calories: Math.round(food.calories_100g * ratio),
      protein_100g: food.protein_100g,
      calories_100g: food.calories_100g
    };
  }, []);

  // Recalcular quando a quantidade mudar
  React.useEffect(() => {
    if (selectedFood) {
      const nutrients = calculateNutrients(selectedFood, amount);
      if (nutrients) {
        onSelect(nutrients);
      }
    }
  }, [amount, selectedFood, calculateNutrients, onSelect]);

  React.useEffect(() => {
    debouncedSearch(inputValue);
  }, [inputValue, debouncedSearch]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || "Selecione um alimento..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Procure um alimento..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            {isLoading && (
              <CommandEmpty>Buscando alimentos...</CommandEmpty>
            )}
            {!isLoading && suggestions.length === 0 && (
              <CommandEmpty>Nenhum alimento encontrado.</CommandEmpty>
            )}
            <CommandGroup>
              {suggestions.map((food) => (
                <CommandItem
                  key={food.id}
                  value={food.name}
                  onSelect={() => {
                    const selected = {
                      name: food.name,
                      protein_100g: food.protein_100g,
                      calories_100g: food.energy_kcal_100g
                    };
                    setSelectedFood(selected);
                    setInputValue(food.name);
                    setOpen(false);
  
                    const nutrients = calculateNutrients(selected, amount);
                    if (nutrients) {
                      onSelect(nutrients);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === food.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {food.name}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({food.protein_100g}g proteína / {food.energy_kcal_100g} kcal por 100g)
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
