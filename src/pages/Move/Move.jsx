import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'


function Move (){

    const navigate = useNavigate()

    return (
        <>
            <div className ="flex">
                <aside>
                    <Sidebar />
                </aside>
                <div className = "">
                   
                </div>
                
            </div>
        </>
    )
}

export default Move