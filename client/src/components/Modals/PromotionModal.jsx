import { Link } from 'react-router-dom';
import { Modal, Button, Spinner, Table  } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PromotionModal() {   

    const [showModal, setShowModal]=useState(false);
    const location = useLocation();
    const initialRender = useRef(true);

    useEffect(() => {
        setTimeout(function(){
            setShowModal(true);
        },5000)
    }, []);

  return (
    <>
    {
        showModal &&
        <div className="promotionModal md:pt-[90px]">
            <div class="modal-content flex flex-col w-[370px] md:w-[600px]">
                <span class="close" onClick={()=>setShowModal(false)}>&times;</span>
                <div className='flex'>
                    <div  style={{"flexBasis":"50%"}}>
                        <img className='w-full' src="https://images.pexels.com/photos/1697902/pexels-photo-1697902.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
                    </div>
                    <div className='flex flex-col justify-center'  style={{"flexBasis":"50%", 'background':'#FFBB00'}}>
                        <h1 className='product-title' 
                        style={{'font-size':'30px',"font-weight":"600",'color':'#000'}}>Welcome To The Right Place</h1>
                    </div>
                </div>
            </div>
        </div>        
    }

    </> 
  );
}
