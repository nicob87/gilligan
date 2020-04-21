/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import React, { Component } from "react";
import { ChartPie, ChartThemeColor } from "@patternfly/react-charts";
import PropTypes from "prop-types";

class RoutersComponent extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    by: PropTypes.string.isRequired,
    colors: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div style={{ height: "275px", width: "300px" }}>
        <ChartPie
          ariaDesc="Average number of pets"
          ariaTitle="Pie chart example"
          constrainToVisibleArea={true}
          data={[
            { x: "Cats", y: 35 },
            { x: "Dogs", y: 55 },
            { x: "Birds", y: 10 }
          ]}
          height={275}
          labels={datum => {
            return `${datum.x}: ${datum.y}`;
          }}
          legendData={[
            { name: "Cats: 35" },
            { name: "Dogs: 55" },
            { name: "Birds: 10" }
          ]}
          legendPosition="bottom"
          padding={{
            bottom: 65,
            left: 20,
            right: 20,
            top: 20
          }}
          themeColor={ChartThemeColor.multiOrdered}
          width={300}
        />
      </div>
    );
  }
}

export default RoutersComponent;