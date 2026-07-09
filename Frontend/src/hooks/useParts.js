import { useEffect, useState } from "react";
import { getAllParts } from "../api/partApi";

const useParts = () => {

    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchParts = async () => {

        try {

            const response = await getAllParts();

            setParts(response.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchParts();

    }, []);

    return {
        parts,
        loading,
        fetchParts
    };

};

export default useParts;