import { $component, $initProps, $refresh } from "../../iv";
import { VdTemplate } from "../../vdom";

interface BsPaginationProps {
    boundaryLinks: boolean;      // Whether to show the "First" and "Last" page links
    directionLinks: boolean;     // Whether to show the "Next" and "Previous" page links
    disabled: boolean;           // Whether to disable buttons from user input
    ellipses: boolean;           // Whether to show ellipsis symbols and first/last page numbers when maxSize > number of pages
    rotate: boolean;             // Whether to rotate pages when maxSize > number of pages. Current page will be in the middle
    collectionSize: number;      // Number of items in collection.
    maxSize: number;             // Maximum number of pages to display.
    page: number;                // Current page.
    pageSize: number;            // Number of items per page.
    size: 'sm' | 'lg';           // Pagination display size: small or large
    pageTemplate: VdTemplate;    // Template function to generate each page cell content
    navTemplate: VdTemplate;     // Template function to generate the navigation cells
    // TODO onPageChange = new EventEmitter<number>(true);
}

class BsPagination {
    props: BsPaginationProps;
    pages: number[] = [];
    pageCount = 0;

    init() {
        $initProps(this, <BsPaginationProps>{
            boundaryLinks: false,
            directionLinks: false,
            disabled: false,
            ellipses: true,
            rotate: false,
            collectionSize: 10,
            maxSize: 0,
            page: 0,
            pageSize: 10,
            size: 'sm',
            pageTemplate: pageCell,
            navTemplate: navigationCell
        });
    }

    render() {
        `---
        % this.selectPage(this.props.page);
        % let p = this.props, hasPrevious = this.hasPrevious(), hasNext=this.hasNext(), disabled=p.disabled;
        % let pageTpl = p.pageTemplate, navTpl = p.navTemplate;
        <ul [a:class]=('pagination' + (p.size ? ' pagination-' + p.size : ''))>
            % if (p.boundaryLinks) {
                <c:navTpl type="First" [disabled]=(disabled || !hasPrevious) [setTabIndex]=hasPrevious action(e)=this.selectPage(1,e) />
            % }
            % if (p.directionLinks) {
                <c:navTpl type="Previous" [disabled]=(disabled || !hasPrevious) [setTabIndex]=hasPrevious action(e)=this.selectPage(p.page-1,e) />
            % }
            % for (let pageNumber of this.pages) {
                % let isEllipsis = this.isEllipsis(pageNumber);
                <li a:class="page-item" [className.active]=(pageNumber === p.page) [class.disabled]=(disabled || isEllipsis)>
                    <c:pageTpl [pageNumber]=pageNumber [ellipsis]=isEllipsis [isCurrentPage]=(pageNumber === p.page) action(e)=this.selectPage(pageNumber,e) />
                </li>
            % }
            % if (p.directionLinks) {
                <c:navTpl type="Next" [disabled]=(disabled || !hasNext) [setTabIndex]=hasNext action(e)=this.selectPage(p.page+1,e) />
            % }
            % if (p.boundaryLinks) {
                <c:navTpl type="Last" [disabled]=(disabled || !hasNext) [setTabIndex]=hasNext action(e)=this.selectPage(this.pageCount,e) />
            % }
        </ul>
        ---`
    }

    private selectPage(pageNumber: number, evt?): void {
        this.updatePages(pageNumber);
        if (evt) {
            evt.cancelBubble=true;
            evt.preventDefault();
            $refresh(this); 
        }
    }

    private hasPrevious(): boolean { return this.props.page > 1; }

    private hasNext(): boolean { return this.props.page < this.pageCount; }

    private isEllipsis(pageNumber): boolean { return pageNumber === -1; }

    /**
     * Appends ellipses and first/last page number to the displayed pages
     */
    private applyEllipses(start: number, end: number) {
        if (this.props.ellipses) {
            if (start > 0) {
                if (start > 1) {
                    this.pages.unshift(-1);
                }
                this.pages.unshift(1);
            }
            if (end < this.pageCount) {
                if (end < (this.pageCount - 1)) {
                    this.pages.push(-1);
                }
                this.pages.push(this.pageCount);
            }
        }
    }

    /**
     * Rotates page numbers based on maxSize items visible.
     * Currently selected page stays in the middle:
     *
     * Ex. for selected page = 6:
     * [5,*6*,7] for maxSize = 3
     * [4,5,*6*,7] for maxSize = 4
     */
    private applyRotation(): [number, number] {
        let p = this.props,
            start = 0,
            end = this.pageCount,
            leftOffset = Math.floor(p.maxSize / 2),
            rightOffset = p.maxSize % 2 === 0 ? leftOffset - 1 : leftOffset;

        if (p.page <= leftOffset) {
            // very beginning, no rotation -> [0..maxSize]
            end = p.maxSize;
        } else if (this.pageCount - p.page < leftOffset) {
            // very end, no rotation -> [len-maxSize..len]
            start = this.pageCount - p.maxSize;
        } else {
            // rotate
            start = p.page - leftOffset - 1;
            end = p.page + rightOffset;
        }

        return [start, end];
    }

    /**
     * Paginates page numbers based on maxSize items per page
     */
    private applyPagination(): [number, number] {
        let p = this.props, page = Math.ceil(p.page / p.maxSize) - 1,
            start = page * p.maxSize,
            end = start + p.maxSize;

        return [start, end];
    }

    private setPageInRange(newPageNo) {
        let p = this.props;
        const prevPageNo = p.page;
        p.page = getValueInRange(newPageNo, this.pageCount, 1);

        if (p.page !== prevPageNo) {
            //p.pageChange.emit(this.page);
        }
    }

    private updatePages(newPage: number) {
        let p = this.props;
        this.pageCount = Math.ceil(p.collectionSize / p.pageSize);

        if (!isNumber(this.pageCount)) {
            this.pageCount = 0;
        }

        // fill-in model needed to render pages
        this.pages.length = 0;
        for (let i = 1; i <= this.pageCount; i++) {
            this.pages.push(i);
        }

        // set page within 1..max range
        this.setPageInRange(newPage);

        // apply maxSize if necessary
        if (p.maxSize > 0 && this.pageCount > p.maxSize) {
            let start = 0;
            let end = this.pageCount;

            // either paginating or rotating page numbers
            if (p.rotate) {
                [start, end] = this.applyRotation();
            } else {
                [start, end] = this.applyPagination();
            }

            this.pages = this.pages.slice(start, end);

            // adding ellipses
            this.applyEllipses(start, end);
        }
    }

}

export let pagination = $component(BsPagination);

const defaultCellContent = {
    "First":"\u00AB\u00AB",
    "Previous":"\u00AB",
    "Next":"\u00BB",
    "Last":"\u00BB\u00BB"
}

function navigationCell(type, disabled, setTabIndex, action) {
    `---
    <li a:class="page-item" [className.disabled]=disabled>
        <a a:aria-label=type a:class="page-link" a:href="" onclick(e)=action(e) 
            [a:tabindex]=(setTabIndex ? null : '-1')>
            <span a:aria-hidden="true">
                {{defaultCellContent[type]}}
            </span>
        </a>
    </li>
    ---`
}

function pageCell(pageNumber, ellipsis, isCurrentPage, action) {
    `---
    % if (ellipsis) {
        <a a:class="page-link">...</a>
    % } else {
        <a a:class="page-link" a:href="" onclick(e)=action(e)>
            {{pageNumber}}
            % if (isCurrentPage) {
                <span a:class="sr-only">(current)</span>
            % }
        </a>
    % }
    ---`
}

function isNumber(value: any): value is number {
    return !isNaN(toInteger(value));
}

function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
}

function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}