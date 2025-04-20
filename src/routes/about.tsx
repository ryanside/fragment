import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/router'
export const Route = createFileRoute('/about')({
  component: RouteComponent,
})



function RouteComponent() {
  console.log("Checking trpc.products.getProducts:", trpc.products.getProducts);
  const productsQuery = useQuery(trpc.products.getProducts.queryOptions())

  return <div>{productsQuery.data?.map((product) => product.description)}</div>
}
