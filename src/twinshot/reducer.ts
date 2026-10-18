import { createDefaultProject, DEFAULT_LOGO, defaultStyling, type ComparisonProject, type ImagePlacement, type LabelStyle, type Layout, type LogoPlacement, type Side } from "./types"

export type Action =
  | { type: "SET_IMAGE"; side: Side; assetId: string | null }
  | { type: "SWAP_IMAGES" }
  | { type: "SET_PLACEMENT"; side: Side; patch: Partial<Omit<ImagePlacement, "assetId">> }
  | { type: "SET_LAYOUT"; layout: Layout }
  | { type: "UPDATE_LABEL"; side: Side; patch: Partial<LabelStyle> }
  | { type: "UPDATE_STYLE"; patch: Partial<ComparisonProject["style"]> }
  | { type: "UPDATE_DIVIDER"; patch: Partial<ComparisonProject["style"]["divider"]> }
  | { type: "SET_LOGO"; assetId: string | null }
  | { type: "UPDATE_LOGO"; patch: Partial<Omit<LogoPlacement, "assetId">> }
  | { type: "SET_OUTPUT"; patch: Partial<ComparisonProject["output"]> }
  | { type: "RESET_STYLES" }
  | { type: "RESET_ALL" }
  | { type: "LOAD_PROJECT"; project: ComparisonProject }

export function projectReducer(state: ComparisonProject, action: Action): ComparisonProject {
  switch (action.type) {
    case "SET_IMAGE":
      return {
        ...state,
        images: { ...state.images, [action.side]: { ...state.images[action.side], assetId: action.assetId } },
      }
    case "SWAP_IMAGES":
      return {
        ...state,
        images: { before: state.images.after, after: state.images.before },
      }
    case "SET_PLACEMENT":
      return {
        ...state,
        images: { ...state.images, [action.side]: { ...state.images[action.side], ...action.patch } },
      }
    case "SET_LAYOUT":
      return { ...state, layout: action.layout }
    case "UPDATE_LABEL":
      return {
        ...state,
        labels: { ...state.labels, [action.side]: { ...state.labels[action.side], ...action.patch } },
      }
    case "UPDATE_STYLE":
      return { ...state, style: { ...state.style, ...action.patch } }
    case "UPDATE_DIVIDER":
      return { ...state, style: { ...state.style, divider: { ...state.style.divider, ...action.patch } } }
    case "SET_LOGO":
      return { ...state, logo: { ...state.logo, assetId: action.assetId } }
    case "UPDATE_LOGO":
      return { ...state, logo: { ...state.logo, ...action.patch } }
    case "SET_OUTPUT":
      return { ...state, output: { ...state.output, ...action.patch } }
    case "RESET_STYLES":
      return {
        ...defaultStyling(),
        images: state.images,
        logo: { ...DEFAULT_LOGO, assetId: state.logo.assetId },
      }
    case "RESET_ALL":
      return createDefaultProject()
    case "LOAD_PROJECT":
      return action.project
  }
}
