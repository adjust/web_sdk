/**
 * Type of attribution object received from the backend.
 *
 * @public
 */
export interface Attribution {

  /** Adjust device identifier */
  adid: string,

  /** Tracker token */
  tracker_token: string,

  /** Tracker name */
  tracker_name: string,

  /** Network grouping level */
  network?: string,

  /** Campaign grouping level */
  campaign?: string,

  /** Ad group grouping level */
  adgroup?: string,

  /** Creative grouping level */
  creative?: string,

  /** Click label */
  click_label?: string,

  /** Attribution state, for example 'installed' or 'reattributed' */
  state: string
}
