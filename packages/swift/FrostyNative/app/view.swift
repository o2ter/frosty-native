//
//  view.swift
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

public protocol FTViewProtocol: View {
    
    init(props: [String: any Sendable], children: [AnyView])
}

struct FTView: FTViewProtocol {
    
    var props: [String: any Sendable]
    
    var children: [AnyView]
    
    init(props: [String: any Sendable], children: [AnyView]) {
        self.props = props
        self.children = children
    }
    
    var body: some View {
        VStack {
            ForEach(Array(children.enumerated()), id: \.offset) {
                $0.element
            }
        }
    }
}

struct FTTextView: FTViewProtocol {
    
    var props: [String: any Sendable]
    
    var children: [AnyView]
    
    init(props: [String: any Sendable], children: [AnyView]) {
        self.props = props
        self.children = children
    }
    
    var content: String {
        return props["text"] as? String ?? ""
    }
    
    @available(macOS 12, iOS 15, tvOS 15, watchOS 8, *)
    var attributes: AttributeContainer {
        let attributes = props["attributes"] as? [String: Any] ?? [:]
        var result: [NSAttributedString.Key: Any] = [:]
        for (key, value) in attributes {
            let _key = NSAttributedString.Key(rawValue: key)
            guard let decoded = FTTextView.decodeAttribute(value, forKey: _key) else { continue }
            result[_key] = decoded
        }
        return AttributeContainer(result)
    }
    
    var body: some View {
        if #available(macOS 12, iOS 15, tvOS 15, watchOS 8, *) {
            Text(AttributedString(content, attributes: self.attributes))
        } else {
            Text(self.content)
        }
    }
}

extension FTTextView {
    
    static func decodeAttribute(_ value: Any, forKey key: NSAttributedString.Key) -> Any? {
        switch key {
        case .strokeWidth: return value as? Double
        default: return nil
        }
    }
}
