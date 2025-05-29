import { createFileRoute } from "@tanstack/react-router"

//import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  //const { user: currentUser } = useAuth()
  const currentUser = null
  return (
    <>
      <div className='max-w-full'>
        <div className='pt-12 m-4'>
          <span className='text-2xl max-w-sm truncate'>
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </span>
          <span>Welcome back, nice to see you again!</span>
        </div>
      </div>
    </>
  )
}
