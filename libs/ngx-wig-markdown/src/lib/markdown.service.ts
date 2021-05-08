import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional, PLATFORM_ID, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as marked from 'marked';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Renderer as MarkedRenderer } from 'marked';


export const errorSrcWithoutHttpClient = '[ngx-markdown] When using the [src] attribute you *have to* pass the `HttpClient` as a parameter of the `forRoot` method. See README for more information';


@Injectable({
  providedIn: 'root'
})
export class MarkdownService {

  private readonly initialMarkedOptions: MarkedOptions = {
    renderer: new MarkedRenderer(),
  };

  
  private _options: MarkedOptions;

  get options(): MarkedOptions { return this._options; }
  set options(value: MarkedOptions) {
    this._options = { ...this.initialMarkedOptions, ...value };
  }

  get renderer(): MarkedRenderer { return this.options.renderer; }
  set renderer(value: MarkedRenderer) {
    this.options.renderer = value;
  }

  constructor(@Inject(PLATFORM_ID) private platform: Object,
  @Optional() private http: HttpClient,
  @Optional() options: MarkedOptions,
  private sanitizer: DomSanitizer,) { 

    this.options = options;
  }

  compile(markdown: string, decodeHtml = false, markedOptions = this.options): string {
    const trimmed = this.trimIndentation(markdown);
    const decoded = decodeHtml ? this.decodeHtml(trimmed) : trimmed;
    const compiled = marked.parse(decoded, markedOptions);
    return this.sanitizer.sanitize(SecurityContext.HTML, compiled);
  }

  getSource(src: string): Observable<string> {
    if (!this.http) {
      throw new Error(errorSrcWithoutHttpClient);
    }
    return this.http
      .get(src, { responseType: 'text' })
      .pipe(map(markdown => this.handleExtension(src, markdown)));
  }


  private decodeHtml(html: string): string {
    if (isPlatformBrowser(this.platform)) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    }
    return html;
  }

  private handleExtension(src: string, markdown: string): string {
    const extension = src
      ? src.split('?')[0].split('.').splice(-1).join()
      : null;
    return extension !== 'md'
      ? '```' + extension + '\n' + markdown + '\n```'
      : markdown;
  }

  private trimIndentation(markdown: string): string {
    if (!markdown) {
      return '';
    }
    let indentStart: number;
    return markdown
      .split('\n')
      .map(line => {
        let lineIdentStart = indentStart;
        if (line.length > 0) {
          lineIdentStart = isNaN(lineIdentStart)
            ? line.search(/\S|$/)
            : Math.min(line.search(/\S|$/), lineIdentStart);
        }
        if (isNaN(indentStart)) {
          indentStart = lineIdentStart;
        }
        return !!lineIdentStart
          ? line.substring(lineIdentStart)
          : line;
      }).join('\n');
  }
}


export class MarkedOptions {
  /**
   * A prefix URL for any relative link.
   */
  baseUrl?: string;

  /**
   * Enable GFM line breaks. This option requires the gfm option to be true.
   */
  breaks?: boolean;

  /**
   * Enable GitHub flavored markdown.
   */
  gfm?: boolean;

  /**
   * Include an id attribute when emitting headings.
   */
  headerIds?: boolean;

  /**
   * Set the prefix for header tag ids.
   */
  headerPrefix?: string;

  /**
   * Set the prefix for code block classes.
   */
  langPrefix?: string;

  /**
   * Mangle autolinks (<email@domain.com>).
   */
  mangle?: boolean;

  /**
   * Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
   */
  pedantic?: boolean;

  /**
   * Type: object Default: new Renderer()
   *
   * An object containing functions to render tokens to HTML.
   */
  renderer?: MarkedRenderer;

  /**
   * Shows an HTML error message when rendering fails.
   */
  silent?: boolean;

  /**
   * Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
   */
  smartLists?: boolean;

  /**
   * Use "smart" typograhic punctuation for things like quotes and dashes.
   */
  smartypants?: boolean;

  /**
   * Generate closing slash for self-closing tags (<br/> instead of <br>)
   */
  xhtml?: boolean;

  /**
   * A function to highlight code blocks. The function takes three arguments: code, lang, and callback.
   */
  highlight?(code: string, lang: string, callback?: (error: any | undefined, code: string) => void): string;
}
