{
  "name": "FoodItem",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the food item"
    },
    "sugar": {
      "type": "number",
      "description": "Sugar content in grams"
    },
    "cost": {
      "type": "number",
      "description": "Cost of the item"
    },
    "quantity": {
      "type": "integer",
      "default": 1,
      "description": "Quantity of the item"
    },
    "category": {
      "type": "string",
      "enum": [
        "fruits",
        "snacks",
        "meals",
        "drinks",
        "sweets",
        "other"
      ],
      "default": "other",
      "description": "Category of food"
    }
  },
  "required": [
    "name",
    "sugar",
    "cost"
  ]
}