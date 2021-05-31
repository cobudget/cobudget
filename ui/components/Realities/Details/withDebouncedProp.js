import React, { Component } from "react";
import _ from "lodash";

export default (propKey, wait) => (WrappedComponent) => {
  class EnhancedComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        debouncedProp: props[propKey],
      };
    }

    componentDidUpdate(prevProps) {
      if (prevProps[propKey] !== this.props[propKey]) {
        if (!this.props[propKey]) {
          // If the prop is cleared, update without waiting
          this.handlePropUpdateDebounced.cancel();
          this.setState({ debouncedProp: this.props[propKey] });
        } else {
          this.handlePropUpdateDebounced(this.props[propKey]);
        }
      }
    }

    componentWillUnmount() {
      this.handlePropUpdateDebounced.cancel();
    }

    handlePropUpdateDebounced = _.debounce((prop) => {
      this.setState({ debouncedProp: prop });
    }, wait);

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...{ [propKey]: this.state.debouncedProp }}
        />
      );
    }
  }

  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";
  EnhancedComponent.displayName = `WithDebouncedProp(${wrappedComponentName})`;

  return EnhancedComponent;
};
