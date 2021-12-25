import { createClient } from "contentful"
import Image from 'next/image'
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"
import Skeleton from "../../components/Skeleton"

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY
})

export const getStaticPaths = async () => {
  const res = await client.getEntries({
    content_type: 'mrsBlog'
  })

  const paths = res.items.map(item => {
    return {
      params: { slug: item.fields.slug }
    }
  })
  return {
    paths,
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  const { items } = await client.getEntries({
    content_type: 'mrsBlog',
    'fields.slug': params.slug
  })

  if (!items.length) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: { blog: items[0] },
    revalidate: 1
  }
}

export default function BlogDetails({ blog }) {
  if (!blod) return <Skeleton />

  const { featureImage, title, tags, method } = blog.fields
  return (
    <div>
      <div className="banner">
        <Image
          src={'https:' + featureImage.fields.file.url}
          width={featureImage.fields.file.details.image.width}
          height={featureImage.fields.file.details.image.height}
        />
        <h2>{ title }</h2>
      </div>
      <div className="info">
        {tags.map(tag => (
          <span key={tag}>{ tag }</span>
        ))}
      </div>
      <div className="method">
          <div>{documentToReactComponents(method)}</div>
      </div>
      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
    </div>
  )
}