const getRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export interface FeedItem {
  name: string
  imageUrl: string
  description: string
}

export const getFeedItem = (index: number): FeedItem => ({
  name: `Random name ${index}`,
  imageUrl: `https://source.unsplash.com/random/250x250?${index}`,
  description:
    `Lorem ${index} Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`.slice(
      getRandom(100, 500)
    ),
})

export const feedItemTemplate = ({ name, imageUrl, description }: FeedItem) => {
  return `
    <div class="feed-item">
      <div class="img"></div>
      <div class="feed-item__content">
        <h3>${name}</h3>
        <p>${description}</p>
      </div>
    </div>
  `
}

export const updateItemTemplate = (item: FeedItem, htmlItem: HTMLElement) => {
  const img = htmlItem.querySelector('img')
  if (img) {
    img.src = item.imageUrl
    img.alt = item.name
  }

  const name = htmlItem.querySelector('h3')
  if (name) {
    name.textContent = item.name
  }

  const description = htmlItem.querySelector('p')
  if (description) {
    description.textContent = item.description
  }

  return htmlItem
}
