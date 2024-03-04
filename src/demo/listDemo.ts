import { VirtualList } from '../virtual-list/VirtualList'
import { FeedItem, feedItemTemplate, getFeedItem, updateItemTemplate } from './data'
import { db } from './database'

const database = db(100, 100, getFeedItem)

export const list = new VirtualList<FeedItem>({
  items: database.load(0).chunk,
  key: 'name',
  renderItem: feedItemTemplate,
  updateItem: updateItemTemplate,
})
