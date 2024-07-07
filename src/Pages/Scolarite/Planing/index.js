// src/components/Planning.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../Middleware/axiosInstance';

const Planning = () => {
    const [planning, setPlanning] = useState([]);
    const [newPlanning, setNewPlanning] = useState({
        ID_Classe: '',
        ID_Matiere: '',
        Jour: 'Lundi',
        HeureDebut: '',
        HeureFin: ''
    });

    useEffect(() => {
        fetchPlanning();
    }, []);

    const fetchPlanning = async () => {
        try {
            const res = await axiosInstance.get('/api/planing');
            setPlanning(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setNewPlanning({ ...newPlanning, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/api/planing', newPlanning);
            setPlanning([...planning, res.data]);
            setNewPlanning({
                ID_Classe: '',
                ID_Matiere: '',
                Jour: 'Lundi',
                HeureDebut: '',
                HeureFin: ''
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/api/planing/${id}`);
            setPlanning(planning.filter(item => item.ID_Planning !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Planning</h1>
            <form onSubmit={handleSubmit}>
                <input type="number" name="ID_Classe" value={newPlanning.ID_Classe} onChange={handleInputChange} placeholder="ID Classe" required />
                <input type="number" name="ID_Matiere" value={newPlanning.ID_Matiere} onChange={handleInputChange} placeholder="ID Matiere" required />
                <select name="Jour" value={newPlanning.Jour} onChange={handleInputChange}>
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                </select>
                <input type="time" name="HeureDebut" value={newPlanning.HeureDebut} onChange={handleInputChange} required />
                <input type="time" name="HeureFin" value={newPlanning.HeureFin} onChange={handleInputChange} required />
                <button type="submit">Add Planning</button>
            </form>
            <ul>
                {planning.map(item => (
                    <li key={item.ID_Planning}>
                        {item.Jour} - {item.HeureDebut} to {item.HeureFin} (Class ID: {item.ID_Classe}, Subject ID: {item.ID_Matiere})
                        <button onClick={() => handleDelete(item.ID_Planning)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Planning;
