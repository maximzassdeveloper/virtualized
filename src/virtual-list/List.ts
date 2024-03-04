import { OnlyNumberAndString } from './types'
import { shallowEqual } from './utils/shallowEqual'

export interface ListProps<T> {
  items: T[]
  key?: keyof OnlyNumberAndString<T>
  renderItem: (item: T) => string
  updateItem: (item: T, htmlItem: HTMLElement) => HTMLElement
  isLoading?: boolean
  error?: string | null
  noResults?: string
}

export class List<T extends Record<string, any>> {
  props: ListProps<T>
  htmlItems: HTMLElement[] = []
  list: HTMLElement | null = null

  constructor(props: ListProps<T>) {
    this.props = props
  }

  private createItem(item: T, index: number): HTMLElement {
    const { renderItem } = this.props
    const itemContainer = document.createElement('div')

    itemContainer.innerHTML = renderItem(item)
    const itemHtml = itemContainer.children[0] as HTMLElement
    itemContainer.remove()

    // if (key && item[key]) {
    // 	itemHtml.setAttribute('data-key', String(item[key]))
    // }

    this.htmlItems[index] = itemHtml
    this.list?.appendChild(itemHtml)

    return itemHtml
  }

  private rerenderItem(newItem: T, index: number): HTMLElement {
    const { updateItem } = this.props

    const htmlItem = this.htmlItems[index]
    updateItem(newItem, htmlItem)

    // if (key && item[key]) {
    // 	itemHtml.setAttribute('data-key', String(item[key]))
    // }

    return htmlItem
  }

  public rerender(newProps: Partial<ListProps<T>>) {
    requestAnimationFrame(() => {
      const oldItems = this.props.items
      this.props = Object.assign(this.props, newProps)

      if (!newProps.items) return

      newProps.items.forEach((newItem, index) => {
        const htmlItem = this.htmlItems[index]
        const oldItem = oldItems[index]

        if (!htmlItem) {
          return this.createItem(newItem, index)
        }

        if (!shallowEqual(newItem, oldItem)) {
          this.rerenderItem(newItem, index)
        }
      })

      const removed = this.htmlItems.splice(newProps.items.length)
      removed.forEach((htmlItem) => htmlItem.remove())
    })
  }

  public render() {
    this.list = document.createElement('div')
    this.list.classList.add('list')
    this.props.items.forEach(this.createItem.bind(this))

    return this.list
  }
}
