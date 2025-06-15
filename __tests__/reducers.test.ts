import store from '../src/services/store';
import { combineReducers } from '@reduxjs/toolkit';
import { constructorReducer, addIngredient, removeIngredient } from '../src/services/slices/constructorSlice';
import { ingredientsReducer, getIngredients } from '../src/services/slices/ingredienceSlice';
import type { TIngredient } from '../src/utils/types';

// rootReducer is not exported, so we define it here for testing
const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  // These are not tested here, so we use dummy reducers
  user: (state = {}) => state,
  orders: (state = {}) => state,
  burgerConstructor: constructorReducer
});

describe('Redux Store Tests', () => {
  describe('rootReducer', () => {
    it('should return initial state when called with undefined state and unknown action', () => {
      const initialState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
      expect(initialState).toEqual({
        ingredients: expect.any(Object),
        user: {},
        orders: {},
        burgerConstructor: {
          constructorItems: {
            bun: null,
            ingredients: []
          },
          isLoading: false,
          error: null
        }
      });
    });
  });

  describe('constructorReducer', () => {
    const mockIngredient: TIngredient = {
      _id: '1',
      name: 'Test Ingredient',
      type: 'main',
      proteins: 10,
      fat: 5,
      carbohydrates: 15,
      calories: 200,
      price: 100,
      image: 'test.jpg',
      image_mobile: 'test-mobile.jpg',
      image_large: 'test-large.jpg'
    };

    it('should handle adding an ingredient', () => {
      const initialState = {
        constructorItems: {
          bun: null,
          ingredients: []
        },
        isLoading: false,
        error: null
      };

      const action = addIngredient(mockIngredient);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients).toHaveLength(1);
      expect(newState.constructorItems.ingredients[0]).toMatchObject({
        ...mockIngredient,
        id: expect.any(String)
      });
    });

    it('should handle removing an ingredient', () => {
      const ingredientWithId = { ...mockIngredient, id: 'test-id' };
      const initialState = {
        constructorItems: {
          bun: null,
          ingredients: [ingredientWithId]
        },
        isLoading: false,
        error: null
      };

      const action = removeIngredient(ingredientWithId);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.ingredients).toHaveLength(0);
    });

    it('should handle adding a bun', () => {
      const bunIngredient: TIngredient = {
        ...mockIngredient,
        type: 'bun'
      };

      const initialState = {
        constructorItems: {
          bun: null,
          ingredients: []
        },
        isLoading: false,
        error: null
      };

      const action = addIngredient(bunIngredient);
      const newState = constructorReducer(initialState, action);

      expect(newState.constructorItems.bun).toMatchObject({
        ...bunIngredient,
        id: expect.any(String)
      });
    });
  });

  describe('ingredientsReducer async actions', () => {
    const mockIngredients: TIngredient[] = [
      {
        _id: '1',
        name: 'Test Ingredient 1',
        type: 'main',
        proteins: 10,
        fat: 5,
        carbohydrates: 15,
        calories: 200,
        price: 100,
        image: 'test1.jpg',
        image_mobile: 'test1-mobile.jpg',
        image_large: 'test1-large.jpg'
      },
      {
        _id: '2',
        name: 'Test Ingredient 2',
        type: 'sauce',
        proteins: 5,
        fat: 3,
        carbohydrates: 8,
        calories: 150,
        price: 80,
        image: 'test2.jpg',
        image_mobile: 'test2-mobile.jpg',
        image_large: 'test2-large.jpg'
      }
    ];

    it('should handle pending state', () => {
      const initialState = {
        ingredients: [],
        isLoading: false,
        error: null
      };
      const action = { type: getIngredients.pending.type };
      const newState = ingredientsReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const initialState = {
        ingredients: [],
        isLoading: true,
        error: null
      };
      const action = { type: getIngredients.fulfilled.type, payload: mockIngredients };
      const newState = ingredientsReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.ingredients).toEqual(mockIngredients);
      expect(newState.error).toBeNull();
    });

    it('should handle rejected state', () => {
      const initialState = {
        ingredients: [],
        isLoading: true,
        error: null
      };
      const errorMessage = 'Failed to fetch ingredients';
      const action = { type: getIngredients.rejected.type, error: { message: errorMessage } };
      const newState = ingredientsReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.ingredients).toEqual([]);
      expect(newState.error).toBe(errorMessage);
    });
  });
}); 