import { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { FoodProps } from '../../types/globalTypes';

type ModalProps = {
  modalAddIsVisible: boolean;
  modalEditIsVisible: boolean;
};

export function Dashboard() {
  const [foods, setFoods] = useState<FoodProps[]>([]);
  const [editingFood, setEditingFood] = useState<FoodProps>({} as FoodProps);
  const [modalIsVisible, setModalIsVisible] = useState<ModalProps>({
    modalAddIsVisible: false,
    modalEditIsVisible: false
  });

  useEffect(() => {

    async function loadFoods() {

      try {

        const { data } = await api.get('/foods');
        setFoods(data)
      } catch (err) {

        console.log(err)
      }
    }

    loadFoods()
  }, []);

  async function handleAddFood(food: FoodProps) {

    try {

      const { data } = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods(prevFood => [...prevFood, data])
    } catch (err) {

      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodProps) {

    try {

      const { data } = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(currentFood =>
        currentFood.id !== data.id ? currentFood : data,
      );

      setFoods(foodsUpdated);
    } catch (err) {

      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {

    try {

      await api.delete(`/foods/${id}`);

      const foodsFiltered = foods.filter(food => food.id !== id);

      setFoods(foodsFiltered);
    } catch (err) {

      console.log(err);
    }
  }

  function handleEditFood(food: FoodProps) {

    setEditingFood(food);
    setModalIsVisible(prev => ({ ...prev, modalEditIsVisible: true }));
  }

  function toggleModal() {

    setModalIsVisible(prev => ({ ...prev, modalAddIsVisible: !prev.modalAddIsVisible }))
  }

  function toggleEditModal() {

    setModalIsVisible(prev => ({ ...prev, modalEditIsVisible: !prev.modalEditIsVisible }))
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalIsVisible.modalAddIsVisible}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={modalIsVisible.modalEditIsVisible}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}