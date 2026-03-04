export const defaultPlannings = {
  masse: {
    label: "Prise de Masse",
    meals: {
      lundi: {
        "petit-dejeuner": 1,
        dejeuner: 2,
        diner: 11,
        collation: 14
      },
      mardi: {
        "petit-dejeuner": 7,
        dejeuner: 5,
        diner: 3,
        collation: 6
      },
      mercredi: {
        "petit-dejeuner": 10,
        dejeuner: 20,
        diner: 13,
        collation: 17
      },
      jeudi: {
        "petit-dejeuner": 4,
        dejeuner: 9,
        diner: 16,
        collation: 12
      },
      vendredi: {
        "petit-dejeuner": 19,
        dejeuner: 15,
        diner: 18,
        collation: 14
      },
      samedi: {
        "petit-dejeuner": 1,
        dejeuner: 11,
        diner: 8,
        collation: 6
      },
      dimanche: {
        "petit-dejeuner": 7,
        dejeuner: 2,
        diner: 3,
        collation: 17
      }
    }
  },
  seche: {
    label: "Sèche",
    meals: {
      lundi: {
        "petit-dejeuner": 4,
        dejeuner: 15,
        diner: 3,
        collation: 12
      },
      mardi: {
        "petit-dejeuner": 19,
        dejeuner: 9,
        diner: 8,
        collation: 6
      },
      mercredi: {
        "petit-dejeuner": 10,
        dejeuner: 2,
        diner: 18,
        collation: 12
      },
      jeudi: {
        "petit-dejeuner": 4,
        dejeuner: 15,
        diner: 13,
        collation: 17
      },
      vendredi: {
        "petit-dejeuner": 1,
        dejeuner: 9,
        diner: 3,
        collation: 6
      },
      samedi: {
        "petit-dejeuner": 19,
        dejeuner: 5,
        diner: 16,
        collation: 12
      },
      dimanche: {
        "petit-dejeuner": 7,
        dejeuner: 20,
        diner: 8,
        collation: 14
      }
    }
  },
  endurance: {
    label: "Endurance",
    meals: {
      lundi: {
        "petit-dejeuner": 19,
        dejeuner: 11,
        diner: 18,
        collation: 17
      },
      mardi: {
        "petit-dejeuner": 1,
        dejeuner: 20,
        diner: 3,
        collation: 14
      },
      mercredi: {
        "petit-dejeuner": 10,
        dejeuner: 2,
        diner: 16,
        collation: 6
      },
      jeudi: {
        "petit-dejeuner": 7,
        dejeuner: 5,
        diner: 13,
        collation: 17
      },
      vendredi: {
        "petit-dejeuner": 4,
        dejeuner: 15,
        diner: 8,
        collation: 12
      },
      samedi: {
        "petit-dejeuner": 19,
        dejeuner: 9,
        diner: 18,
        collation: 14
      },
      dimanche: {
        "petit-dejeuner": 1,
        dejeuner: 11,
        diner: 3,
        collation: 6
      }
    }
  },
  sante: {
    label: "Santé Générale",
    meals: {
      lundi: {
        "petit-dejeuner": 10,
        dejeuner: 15,
        diner: 8,
        collation: 12
      },
      mardi: {
        "petit-dejeuner": 4,
        dejeuner: 2,
        diner: 18,
        collation: 6
      },
      mercredi: {
        "petit-dejeuner": 19,
        dejeuner: 9,
        diner: 16,
        collation: 17
      },
      jeudi: {
        "petit-dejeuner": 1,
        dejeuner: 5,
        diner: 3,
        collation: 14
      },
      vendredi: {
        "petit-dejeuner": 7,
        dejeuner: 20,
        diner: 13,
        collation: 12
      },
      samedi: {
        "petit-dejeuner": 10,
        dejeuner: 11,
        diner: 8,
        collation: 6
      },
      dimanche: {
        "petit-dejeuner": 4,
        dejeuner: 15,
        diner: 18,
        collation: 17
      }
    }
  }
};

export const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const mealTypes = [
  { id: "petit-dejeuner", label: "Petit-déj" },
  { id: "dejeuner", label: "Déjeuner" },
  { id: "diner", label: "Dîner" },
  { id: "collation", label: "Collation" }
];
