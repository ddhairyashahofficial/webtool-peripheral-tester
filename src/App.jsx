import { useState, useEffect, useCallback } from "react";

import "./index.css";

import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import LiveInputsBanner from "./components/LiveInputsBanner";
import PointerVisualizer from "./components/PointerVisualizer";
import KeyboardVisualizer from "./components/KeyboardVisualizer";
import TouchVisualizer from "./components/TouchVisualizer";
import GamepadVisualizer from "./components/GamepadVisualizer";

import usePointer from "./hooks/usePointer";
import useKeyboard from "./hooks/useKeyboard";
import useGamepad from "./hooks/useGamepad";
import useSafeLocalStorage from "./hooks/useSafeLocalStorage";