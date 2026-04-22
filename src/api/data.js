
export function createMockDatabase() {
  return {
    // ==================
    // Mock * databáze *
    // ==================

    products: [
      {
        id: "p1",
        name: "Sušené datle BIO",
        price: 50,
        stockCount: 10,
        status: "ACTIVE", 
      },
      {
        id: "p2",
        name: "Kandovaný zázvor",
        price: 80,
        stockCount: 0,
        status: "OUT_OF_STOCK", 
      },
      {
        id: "p3",
        name: "Lískové oříšky",
        price: 120,
        stockCount: 15,
        status: "ACTIVE",
      },
      {
        id: "p4",
        name: "Vyřazený produkt",
        price: 10,
        stockCount: 5,
        status: "ARCHIVED",
      },
    ],

    orders: [],

  };
}