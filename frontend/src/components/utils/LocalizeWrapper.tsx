import { PureComponent } from "react";
import { setI18N } from "../../libraries/language";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

// TODO: migrate from react-localize-redux to a package that supports hooks
class LocalizeWrapper extends PureComponent<LocalizeContextProps> {
  constructor(props: LocalizeContextProps) {
    super(props);
    setI18N(this.props);
  }

  render() {
    const { children } = this.props;
    return <>{children}</>;
  }
}

export default withLocalize(LocalizeWrapper);
