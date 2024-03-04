import { List, ListProps } from './List'
import { throttleCallback } from './utils/throttleCallback'

export interface VirtualListProps<T> extends ListProps<T> {}

type VirtualItemInfo = {
  offsetTop: number
  index: number
  height: number
}
type VirtualListItem<T> = VirtualItemInfo & { item: T }

const SCROLL_HANDLER_INTERVAL = 150
const KEY_ATTRIBUTE_NAME = 'data-index'

export class VirtualList<T extends Record<string, any>> {
  props: VirtualListProps<T>
  data: T[] = []
  key: ListProps<T>['key']
  itemsCount = 100
  estimateHeight = 250
  listElement: HTMLElement | null = null
  listElementHeight = 0
  scrollElement: HTMLElement | null = null
  scrollElementHeight = 0
  overscan = 2
  items: VirtualItemInfo[] = []
  resizeObserverItems: ResizeObserver | null = null

  constructor(props: VirtualListProps<T>) {
    this.props = props
    this.data = props.items
    this.key = props.key
  }

  private getElementHeight(el: HTMLElement): number {
    if (el.isConnected) {
      return el.getBoundingClientRect().height
    }

    const copied = el.cloneNode(true) as HTMLElement
    copied.style.visibility = 'hidden'
    copied.style.position = 'absolute'
    copied.style.zIndex = '-1000'
    document.body.appendChild(copied)

    const { height } = copied.getBoundingClientRect()
    copied.remove()

    return height
  }

  getItemKey(index: number): string {
    return String(index)
  }

  private calculateItemOffsetTop(index: number): number {
    let resultOffsetTop = 0
    for (let i = 0; i < index; i++) {
      resultOffsetTop += this.getItemHeight(i)
    }

    return resultOffsetTop
  }

  private getItemHeight(index: number): number {
    return this.items[index].height ?? this.estimateHeight
  }

  private getItemOffsetTop(index: number): number {
    return this.items[index].offsetTop ?? index * this.estimateHeight
  }

  private setItemHeight(index: number, newHeight: number) {
    const heightDiff = newHeight - this.getItemHeight(index)

    this.items[index].height = newHeight
    this.listElementHeight += heightDiff

    if (this.listElement) {
      this.listElement.style.height = `${this.listElementHeight}px`
    }
  }

  private setItemOffsetTop(index: number, newOffsetTop: number) {
    this.items[index].offsetTop = newOffsetTop
  }

  private createVirtualListItems(
    startIndex: number,
    endIndex: number,
    indexPrefix: number = 0
  ): VirtualListItem<T>[] {
    return this.data.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: indexPrefix + index,
      offsetTop: this.getItemOffsetTop(indexPrefix + index),
      height: this.getItemHeight(indexPrefix + index),
    }))
  }

  render() {
    this.items = []
    this.data.forEach((_, index) => {
      this.items.push({
        index,
        height: this.estimateHeight,
        offsetTop: index * this.estimateHeight,
      })
    })

    const list = new List<VirtualListItem<T>>({
      items: this.createVirtualListItems(0, 6),
      renderItem: (virtualItem) => {
        const { index, item } = virtualItem

        const div = document.createElement('div')
        div.innerHTML = this.props.renderItem(item)
        div.setAttribute(KEY_ATTRIBUTE_NAME, this.getItemKey(index))

        const height = this.getElementHeight(div)
        const offsetTop = this.calculateItemOffsetTop(index)
        this.setItemHeight(index, height)
        this.setItemOffsetTop(index, offsetTop)

        div.style.position = 'absolute'
        div.style.transform = `translateY(${offsetTop}px)`

        // this.resizeObserverItems?.observe(div)

        return div.outerHTML
      },
      updateItem: (virtualItem, htmlItem) => {
        const { index, item } = virtualItem

        this.props.updateItem(item, htmlItem)
        htmlItem.setAttribute(KEY_ATTRIBUTE_NAME, this.getItemKey(index))

        const height = this.getElementHeight(htmlItem)
        const offsetTop = this.calculateItemOffsetTop(index)
        this.setItemHeight(index, height)
        this.setItemOffsetTop(index, offsetTop)

        htmlItem.style.transform = `translateY(${offsetTop}px)`

        return htmlItem
      },
    })

    // ------------------ Create scroll element ---------------------
    this.scrollElement = document.createElement('div')
    this.scrollElement.style.overflow = `auto`
    this.scrollElement.style.height = `${window.innerHeight}px`
    this.scrollElement.style.width = `${600}px`

    // Items observer
    // this.resizeObserverItems = new ResizeObserver((entries) => {
    // 	entries.forEach((entry) => {
    // 		const element = entry.target as HTMLElement

    // 		if (!element.isConnected) {
    // 			this.resizeObserverItems?.unobserve(element)
    // 		}

    // 		const index = Number(element.dataset.index)
    // 		if (isNaN(index)) {
    // 			console.log(`Incorrect data-index attribute, ${index}`)
    // 		}

    // 		this.setItemHeight(index, entry.contentBoxSize[0].blockSize)
    // 	})
    // })

    this.listElement = list.render()
    this.listElement.style.position = 'relative'
    this.scrollElement.append(this.listElement)
    this.listElementHeight = this.estimateHeight * this.itemsCount
    this.listElement.style.height = `${this.listElementHeight}px`

    // Scroll container observer
    const scrollElementObserver = new ResizeObserver(([entry]) => {
      if (!entry.target.isConnected) {
        scrollElementObserver.disconnect()
      }
      this.scrollElementHeight = entry.contentBoxSize[0].blockSize
    })
    scrollElementObserver.observe(this.scrollElement)

    // ------------------ Scroll handler ---------------------
    const handleScroll = () => {
      requestAnimationFrame(() => {
        if (!this.scrollElement) return

        const scrollTop = this.scrollElement.scrollTop
        let startIndex = -1
        let endIndex = -1
        let currentOffset = 0

        for (let i = 0; i < this.data.length; i++) {
          currentOffset += this.getItemHeight(i)

          if (currentOffset >= scrollTop && startIndex == -1) {
            startIndex = i
          }

          if (currentOffset >= scrollTop + this.scrollElementHeight && endIndex == -1) {
            endIndex = i
            break
          }
        }

        startIndex = Math.max(0, startIndex - this.overscan)
        endIndex = Math.min(this.itemsCount, endIndex + this.overscan)

        const itemsToRender = this.createVirtualListItems(startIndex, endIndex + 1, startIndex)
        list.rerender({
          items: itemsToRender,
        })
      })
    }

    this.scrollElement.addEventListener(
      'scroll',
      // throttleCallback(handleScroll, SCROLL_HANDLER_INTERVAL)
      handleScroll
    )

    return this.scrollElement
  }

  destroy() {}
}
