import { createSlice } from '@reduxjs/toolkit';

export type modalState = {
    modal:boolean;
    modalCochon:boolean;
    modalAgneau:boolean;
    modalBarbecue:boolean;
    modalAccompagnement:boolean;
}

const initialState : modalState = {
    modal:false,
    modalCochon:false,
    modalAgneau:false,
    modalBarbecue:false,
    modalAccompagnement:false,
 };

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        setModalClose: state => {
            state.modal=false;
            state.modalCochon=false;
            state.modalAgneau=false;
            state.modalBarbecue=false;
            state.modalAccompagnement=false;
        },
        setModalOpenCochon: state => {
            state.modal=true;
            state.modalCochon=true;
        },
        setModalOpenAgneau: state => {
            state.modal=true;
            state.modalAgneau=true;
        },
        setModalOpenBarbecue: state => {
            state.modal=true;
            state.modalBarbecue=true;
        },
        setModalOpenAccompagnement: state => {
            state.modal=true;
            state.modalAccompagnement=true;
        }
    },
});
  
export const{setModalClose, setModalOpenCochon, setModalOpenAgneau, setModalOpenBarbecue, setModalOpenAccompagnement} = modalSlice.actions;

export default modalSlice.reducer;