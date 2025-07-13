import ScrollToTop from './ScrollToTop';
import OrbitingDotsSpinner from './OrbitingDotsSpinner';



export default function Loading() {
  
  
  return (
      <div className="flex justify-center items-center w-full h-[75vh]">
        <ScrollToTop />
        
        <OrbitingDotsSpinner />


      </div>
  )
}